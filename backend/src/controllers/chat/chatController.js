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

        const chats = await Chat.find({
            'participants.userId': userId,
            isActive: true,
            deletedBy: { $not: { $elemMatch: { userId } } }
        })
            .populate('participants.userId', 'profile phoneNumber isOnline lastSeen isVerified')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 })
            .limit(50);

        // Transform chats for frontend
        const transformedChats = chats.map(chat => {
            // Ensure userId is compared as string
            const currentUserId = userId.toString();

            const otherParticipant = chat.participants.find(
                p => p.userId._id.toString() !== currentUserId
            );
            const myParticipant = chat.participants.find(
                p => p.userId._id.toString() === currentUserId
            );

            // Safety check - if no other participant found, skip this chat
            if (!otherParticipant || !myParticipant) {
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
                },
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                unreadCount: myParticipant.unreadCount,
                createdAt: chat.createdAt,
                // Intimacy level based ONLY on male messages
                intimacy: (() => {
                    const maleParticipant = chat.participants.find(p => p.role === 'male');
                    const maleUserId = maleParticipant?.userId._id.toString();
                    const maleMessageCount = maleUserId ? (chat.messageCountByUser?.get(maleUserId) || 0) : 0;
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

        // Check if other user exists
        const otherUser = await User.findById(otherUserId).select('role');
        if (!otherUser) {
            throw new NotFoundError('User not found');
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
                .populate('participants.userId', 'profile phoneNumber isOnline lastSeen isVerified')
                .populate('lastMessage');
        }

        // Transform for frontend - ensure string comparison
        const currentUserId = userId.toString();

        const otherParticipant = chat.participants.find(
            p => p.userId._id.toString() !== currentUserId
        );
        const myParticipant = chat.participants.find(
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
                const maleMessageCount = maleUserId ? (chat.messageCountByUser?.get(maleUserId) || 0) : 0;
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
            'participants.userId': userId
        })
            .populate('participants.userId', 'profile phoneNumber isOnline lastSeen isVerified')
            .populate('lastMessage');

        if (!chat) {
            throw new NotFoundError('Chat not found');
        }

        // Transform for frontend - ensure string comparison
        const currentUserId = userId.toString();

        const otherParticipant = chat.participants.find(
            p => p.userId._id.toString() !== currentUserId
        );
        const myParticipant = chat.participants.find(
            p => p.userId._id.toString() === currentUserId
        );

        if (!otherParticipant || !myParticipant) {
            throw new NotFoundError('Invalid chat participants');
        }

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
                const maleMessageCount = maleUserId ? (chat.messageCountByUser?.get(maleUserId) || 0) : 0;
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

        // Verify user is part of this chat
        const chat = await Chat.findOne({
            _id: chatId,
            'participants.userId': userId
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
            .populate('senderId', 'profile')
            .populate('receiverId', 'profile');

        // Mark messages as read
        await Message.updateMany(
            {
                chatId,
                receiverId: userId,
                status: { $in: ['sent', 'delivered'] }
            },
            {
                status: 'read',
                readAt: new Date()
            }
        );

        // Update chat unread count
        await chat.markAsRead(userId);
        await chat.save();

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
