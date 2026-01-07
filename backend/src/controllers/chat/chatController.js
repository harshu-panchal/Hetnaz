/**
 * Chat Controller - REST API for Chat Operations
 * @owner: Harsh (Chat Domain)
 * @purpose: Handle chat list, message history, chat creation
 */

import Chat from '../../models/Chat.js';
import Message from '../../models/Message.js';
import User from '../../models/User.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { getLevelInfo } from '../../utils/intimacyLevel.js';
import autoMessageService from '../../services/user/autoMessageService.js';
import { calculateDistance, formatDistance } from '../../utils/distanceCalculator.js';

/**
 * Get user's chat list
 */
export const getMyChatList = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { language = 'en' } = req.query;

        // Trigger auto-messages for male users (non-blocking)
        if (req.user.role === 'male') {
            autoMessageService.processAutoMessagesForMale(userId).catch(err => {
                // Log error but don't block the response
                console.error('Auto-message processing error:', err);
            });
        }

        // Fetch chats
        const chats = await Chat.find({
            'participants.userId': userId,
            isActive: true,
            deletedBy: { $not: { $elemMatch: { userId } } }
        })
            .select('participants lastMessage lastMessageAt createdAt messageCountByUser intimacyLevel')
            .populate({
                path: 'participants.userId',
                select: 'profile.name profile.photos profile.name_hi profile.name_en profile.location phoneNumber isOnline lastSeen isVerified role'
            })
            .populate({
                path: 'lastMessage',
                select: 'content messageType senderId createdAt status'
            })
            .sort({ lastMessageAt: -1 })
            .limit(50)
            .lean();

        // Use location from req.user (already populated in auth middleware)
        const myCoords = req.user?.profile?.location?.coordinates?.coordinates;
        const hasMyCoords = myCoords && myCoords[0] !== 0;

        // Transform chats for frontend
        const transformedChats = chats.map(chat => {
            // Ensure userId is compared as string
            const currentUserId = userId.toString();

            // Safety check: Filter out participants with null/undefined userId (deleted users)
            const validParticipants = chat.participants.filter(p => p.userId && p.userId._id);

            if (validParticipants.length < 2) {
                console.warn(`[CHAT-LIST] Chat ${chat._id} has invalid participants - skipping`);
                return null;
            }

            const otherParticipant = validParticipants.find(
                p => p.userId._id.toString() !== currentUserId
            );
            const myParticipant = validParticipants.find(
                p => p.userId._id.toString() === currentUserId
            );

            // Safety check - if no other participant found, skip this chat
            if (!otherParticipant || !myParticipant) {
                console.warn(`[CHAT-LIST] Chat ${chat._id} missing valid participants - skipping`);
                return null;
            }

            // CRITICAL: Handle translated names with original fallback
            const otherUserDoc = otherParticipant.userId;
            const name = (language === 'hi' ? otherUserDoc.profile?.name_hi : otherUserDoc.profile?.name_en) ||
                otherUserDoc.profile?.name ||
                `User ${otherUserDoc.phoneNumber}`;

            return {
                _id: chat._id,
                otherUser: {
                    _id: otherUserDoc._id,
                    name: name,
                    avatar: otherUserDoc.profile?.photos?.[0]?.url || null,
                    isOnline: otherUserDoc.isOnline,
                    lastSeen: otherUserDoc.lastSeen,
                    isVerified: otherUserDoc.isVerified,
                    distance: (() => {
                        const otherCoords = otherUserDoc.profile?.location?.coordinates?.coordinates;
                        if (hasMyCoords && otherCoords && otherCoords[0] !== 0) {
                            const dist = calculateDistance(
                                { lat: myCoords[1], lng: myCoords[0] },
                                { lat: otherCoords[1], lng: otherCoords[0] }
                            );
                            return formatDistance(dist);
                        }
                        return null;
                    })()
                },
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                unreadCount: myParticipant.unreadCount,
                createdAt: chat.createdAt,
                // Intimacy level based ONLY on male messages
                intimacy: (() => {
                    const maleParticipant = validParticipants.find(p => p.role === 'male');
                    const maleUserId = maleParticipant?.userId._id.toString();
                    // When using lean(), Map becomes a plain object
                    const maleMessageCount = maleUserId ? (chat.messageCountByUser?.[maleUserId] || 0) : 0;
                    return getLevelInfo(maleMessageCount);
                })(),
            };
        }).filter(Boolean); // Remove null entries

        res.status(200).json({
            status: 'success',
            data: { chats: transformedChats }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get or create chat with a user
 */
export const getOrCreateChat = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.body;

        if (!otherUserId) {
            throw new BadRequestError('Other user ID is required');
        }

        if (userId === otherUserId) {
            throw new BadRequestError('Cannot create chat with yourself');
        }

        // Get current user info
        const currentUser = await User.findById(userId).select('role');

        // Check if other user exists and is active
        const otherUser = await User.findOne({
            _id: otherUserId,
            isActive: true,
            isDeleted: false
        }).select('role');

        if (!otherUser) {
            throw new NotFoundError('User not found or account deleted');
        }

        // CRITICAL: Gender validation - prevent same-gender chats
        // Males can only chat with females, females can only chat with males
        // Admins can chat with anyone
        if (currentUser.role !== 'admin' && otherUser.role !== 'admin') {
            if (currentUser.role === otherUser.role) {
                throw new BadRequestError(`${currentUser.role === 'male' ? 'Males' : 'Females'} can only chat with ${currentUser.role === 'male' ? 'females' : 'males'}`);
            }
        }

        // Find existing chat
        let chat = await Chat.findOne({
            'participants.userId': { $all: [userId, otherUserId] }
        })
            .populate('participants.userId', 'profile phoneNumber isOnline lastSeen isVerified')
            .populate('lastMessage');

        // Create new chat if doesn't exist
        if (!chat) {
            chat = await Chat.create({
                participants: [
                    { userId, role: req.user.role },
                    { userId: otherUserId, role: otherUser.role }
                ],
                isActive: true,
            });

            chat = await Chat.findById(chat._id)
                .populate('participants.userId', 'profile.name profile.photos profile.location phoneNumber isOnline lastSeen isVerified role')
                .populate('lastMessage')
                .lean();
        }

        // Transform for frontend - ensure string comparison
        const currentUserId = userId.toString();

        // Safety check: Filter out participants with null/undefined userId
        const validParticipants = chat.participants.filter(p => p.userId && p.userId._id);

        const otherParticipant = validParticipants.find(
            p => p.userId._id.toString() !== currentUserId
        );
        const myParticipant = validParticipants.find(
            p => p.userId._id.toString() === currentUserId
        );

        const transformedChat = {
            _id: chat._id,
            otherUser: {
                _id: otherParticipant.userId._id,
                name: otherParticipant.userId.profile?.name || `User ${otherParticipant.userId.phoneNumber}`,
                avatar: otherParticipant.userId.profile?.photos?.[0]?.url || null,
                isOnline: otherParticipant.userId.isOnline,
                lastSeen: otherParticipant.userId.lastSeen,
                isVerified: otherParticipant.userId.isVerified,
            },
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
            unreadCount: myParticipant?.unreadCount || 0,
            createdAt: chat.createdAt,
            // Intimacy level based ONLY on male messages
            intimacy: (() => {
                const maleParticipant = chat.participants.find(p => p.role === 'male');
                const maleUserId = maleParticipant?.userId._id.toString();
                // When using lean(), Map becomes a plain object
                const maleMessageCount = maleUserId ? (chat.messageCountByUser?.[maleUserId] || 0) : 0;
                return getLevelInfo(maleMessageCount);
            })(),
        };

        res.status(200).json({
            status: 'success',
            data: { chat: transformedChat }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific chat by ID
 */
export const getChatById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            'participants.userId': userId,
            isActive: true
        })
            .populate('participants.userId', 'profile.name profile.photos profile.location phoneNumber isOnline lastSeen isVerified role')
            .populate('lastMessage')
            .lean();

        if (!chat) {
            throw new NotFoundError('Chat not found');
        }

        // Transform for frontend - ensure string comparison
        const currentUserId = userId.toString();

        // Safety check: Filter out participants with null/undefined userId
        const validParticipants = chat.participants.filter(p => p.userId && p.userId._id);

        const otherParticipant = validParticipants.find(
            p => p.userId._id.toString() !== currentUserId
        );
        const myParticipant = validParticipants.find(
            p => p.userId._id.toString() === currentUserId
        );

        if (!otherParticipant || !myParticipant) {
            throw new NotFoundError('Invalid chat participants');
        }

        // Check block status in parallel with basic auth
        const [me, other] = await Promise.all([
            User.findById(userId).select('blockedUsers').lean(),
            User.findById(otherParticipant.userId._id).select('blockedUsers').lean()
        ]);

        const transformedChat = {
            _id: chat._id,
            otherUser: {
                _id: otherParticipant.userId._id,
                name: otherParticipant.userId.profile?.name || `User ${otherParticipant.userId.phoneNumber}`,
                avatar: otherParticipant.userId.profile?.photos?.[0]?.url || null,
                isOnline: otherParticipant.userId.isOnline,
                lastSeen: otherParticipant.userId.lastSeen,
                isVerified: otherParticipant.userId.isVerified,
            },
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
            unreadCount: myParticipant.unreadCount,
            createdAt: chat.createdAt,
            // Intimacy level based ONLY on male messages
            intimacy: (() => {
                const maleParticipant = chat.participants.find(p => p.role === 'male');
                const maleUserId = maleParticipant?.userId._id.toString();
                // When using lean(), Map becomes a plain object
                const maleMessageCount = maleUserId ? (chat.messageCountByUser?.[maleUserId] || 0) : 0;
                return getLevelInfo(maleMessageCount);
            })(),
        };

        res.status(200).json({
            status: 'success',
            data: { chat: transformedChat }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get messages for a chat
 */
export const getChatMessages = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;
        const { limit = 10, before } = req.query;

        // Verify user is part of this chat and chat is active
        const chat = await Chat.findOne({
            _id: chatId,
            'participants.userId': userId,
            isActive: true
        });

        if (!chat) {
            throw new NotFoundError('Chat not found');
        }

        // Build query
        const query = {
            chatId,
            isDeleted: false
        };

        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        // Fetch messages
        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('senderId', 'profile.name profile.photos')
            .populate('receiverId', 'profile.name profile.photos')
            .lean();

        // Mark messages as read and update chat unread count in parallel
        Promise.all([
            Message.updateMany(
                {
                    chatId,
                    receiverId: userId,
                    status: { $in: ['sent', 'delivered'] }
                },
                {
                    status: 'read',
                    readAt: new Date()
                }
            ),
            // Atomic update for chat unread count
            Chat.updateOne(
                { _id: chatId, 'participants.userId': userId },
                { $set: { 'participants.$.unreadCount': 0 } }
            )
        ]).catch(e => console.error('[MSG-READ] Failed to update read status:', e));

        res.status(200).json({
            status: 'success',
            data: {
                messages: messages.reverse(), // Return in chronological order
                hasMore: messages.length === parseInt(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark chat as read
 */
export const markChatAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            'participants.userId': userId
        });

        if (!chat) {
            throw new NotFoundError('Chat not found');
        }

        await chat.markAsRead(userId);
        await chat.save();

        res.status(200).json({
            status: 'success',
            message: 'Chat marked as read'
        });
    } catch (error) {
        next(error);
    }
};
