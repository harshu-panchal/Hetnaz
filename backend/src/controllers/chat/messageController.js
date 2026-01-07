/**
 * Message Controller - Message Sending with Coin Transactions
 * @owner: Harsh (Chat Domain) + Sujal (Coin Transactions)
 * @purpose: Handle message sending, gifting with coin deduction
 */

import Message from '../../models/Message.js';
import Chat from '../../models/Chat.js';
import User from '../../models/User.js';
import Gift from '../../models/Gift.js';
import Transaction from '../../models/Transaction.js';
import AppSettings from '../../models/AppSettings.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import transactionManager from '../../core/transactions/transactionManager.js';
import dataValidation from '../../core/validation/dataValidation.js';
import logger from '../../utils/logger.js';
import { checkLevelUp, getLevelInfo } from '../../utils/intimacyLevel.js';
import { emitNewMessage, emitBalanceUpdate } from '../../socket/chatHandlers.js';
import chatNotificationService from '../../services/notification/chatNotification.service.js';
import earningBatchService from '../../services/wallet/earningBatchService.js';

// Helper functions to get costs from AppSettings
const getMessageCost = async (userTier) => {
    const settings = await AppSettings.getSettings();
    const tierCosts = {
        basic: settings.messageCosts.basic,
        silver: settings.messageCosts.silver,
        gold: settings.messageCosts.gold,
        platinum: settings.messageCosts.platinum,
    };
    return tierCosts[userTier] || settings.messageCosts.basic;
};

const getHiMessageCost = async () => {
    const settings = await AppSettings.getSettings();
    return settings.messageCosts.hiMessage;
};

const getImageMessageCost = async () => {
    const settings = await AppSettings.getSettings();
    return settings.messageCosts.imageMessage;
};


/**
 * Send a text message
 */
export const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { chatId, content, messageType = 'text', attachments } = req.body;

        // Content is required for text messages, but optional for image messages with attachments
        if (messageType === 'text' && (!content || content.trim().length === 0)) {
            throw new BadRequestError('Message content is required');
        }

        if (messageType === 'image' && (!attachments || attachments.length === 0)) {
            throw new BadRequestError('Attachments are required for image messages');
        }

        // Verify chat exists and user is participant
        const chat = await Chat.findOne({
            _id: chatId,
            'participants.userId': senderId
        });

        if (!chat) {
            throw new NotFoundError('Chat not found');
        }

        // 1. STAGE 1: Parallelize configuration and basic user checks (Fast)
        const [sender, receiver, MESSAGE_COST] = await Promise.all([
            User.findById(senderId).select('blockedUsers memberTier profile coinBalance'),
            User.findById(receiverId).select('blockedUsers profile'),
            (messageType === 'image' ? getImageMessageCost() : getMessageCost(req.user.memberTier))
        ]);

        if (!sender || !receiver) throw new NotFoundError('User not found');

        if (sender.blockedUsers.some(id => id.toString() === receiverId.toString())) {
            throw new BadRequestError('You have blocked this user. Unblock to send messages.');
        }
        if (receiver.blockedUsers.some(id => id.toString() === senderId.toString())) {
            throw new BadRequestError('You cannot send messages to this user as you have been blocked.');
        }

        // If sender is male, deduct coins (ATOMICTALLY)
        let updatedSender = null;
        if (req.user.role === 'male') {
            updatedSender = await User.findOneAndUpdate(
                { _id: senderId, coinBalance: { $gte: MESSAGE_COST } },
                { $inc: { coinBalance: -MESSAGE_COST } },
                { new: true, lean: true, select: 'coinBalance' }
            );

            if (!updatedSender) {
                // If null, it means condition (balance >= cost) failed
                throw new BadRequestError('Insufficient coin balance');
            }

            // ⚠️ Low Balance Warning (Fire-and-Forget)
            if (updatedSender.coinBalance < 50 && updatedSender.coinBalance > 0) {
                setImmediate(() => {
                    chatNotificationService.notifyLowBalance(senderId, updatedSender.coinBalance)
                        .catch(e => console.error('[LOW-BALANCE] Notification failed:', e));
                });
            }

            // 2. Batch Credit to Receiver (Optimized for performance)
            earningBatchService.addEarning(receiverId, {
                amount: MESSAGE_COST,
                type: messageType === 'image' ? 'image_earned' : 'message_earned',
                relatedUserId: senderId,
                relatedChatId: chatId,
                description: `${messageType === 'image' ? 'Image' : 'Message'} received`
            });

            // 3. Create Debit Transaction Record for Sender (Immediate)
            Transaction.create({
                userId: senderId,
                type: messageType === 'image' ? 'image_spent' : 'message_spent',
                direction: 'debit',
                amountCoins: MESSAGE_COST,
                status: 'completed',
                balanceAfter: updatedSender.coinBalance,
                relatedUserId: receiverId,
                relatedChatId: chatId,
                description: `${messageType === 'image' ? 'Image' : 'Message'} sent`
            }).catch(err => console.error('[TX] Failed to save sender transaction log:', err));
        }

        // Create message
        const message = await Message.create({
            chatId,
            senderId,
            receiverId,
            content: content || '',
            messageType,
            attachments,
            status: 'sent'
        });

        // Update chat metadata locally for level calculation (Optimize later with atomic chat update)
        // We use atomic update for the persistence to avoid conflicts

        // Intensity Points
        const intensityPoints = (messageType === 'image') ? 2 : 1;

        // Perform ATOMIC Chat Update
        // This acts as "incrementUnread" + "updateLastMessage" + "updateCounters" all in one
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId },
            {
                $set: {
                    lastMessage: message._id,
                    lastMessageAt: new Date()
                },
                $inc: {
                    totalMessageCount: intensityPoints,
                    [`messageCountByUser.${senderId}`]: intensityPoints,
                    // Increment unread count for the OTHER participant (receiver)
                    // We need to identify which array element corresponds to receiver
                    // Since we can't easily do positional update without a query, we'll try a simpler approach
                    // OR stick to the robust 'save' but with retries? 
                    // NO, atomic is better. We will use arrayFilters to update the correct participant!
                }
            },
            { new: true }
        );

        // Handle Unread Count separately or use arrayFilters if configured
        // For simplicity and speed in this "fix", we will use a separate atomic update for unread
        // which avoids the version error
        Chat.updateOne(
            { _id: chatId, 'participants.userId': receiverId },
            { $inc: { 'participants.$.unreadCount': 1 } }
        ).catch(e => console.error('[CHAT] Unread count update failed:', e));


        // Re-read chat or use updatedChat for Level Check
        // Only count MALE messages for intimacy level progression
        let levelUpInfo = null;
        if (req.user.role === 'male' && updatedChat) {
            const maleParticipant = updatedChat.participants.find(p => p.role === 'male');
            const maleUserId = maleParticipant?.userId.toString();
            const currentMaleMessages = updatedChat.messageCountByUser?.get(maleUserId) || 0;
            const previousMessageCount = currentMaleMessages - intensityPoints;

            const levelUpCheck = checkLevelUp(previousMessageCount, currentMaleMessages);
            if (levelUpCheck.leveledUp) {
                // Perform another atomic update for level
                Chat.updateOne({ _id: chatId }, {
                    $set: {
                        intimacyLevel: levelUpCheck.newLevel,
                        lastLevelUpAt: new Date()
                    }
                }).catch(e => console.error('[CHAT] Level update failed:', e));
                levelUpInfo = levelUpCheck.newLevelInfo;
                logger.info(`🎉 Chat ${chatId} leveled up`);
            }
        }

        // Build response message without extra findById (Populate manually from existing objects)
        const populatedMessage = message.toObject();
        populatedMessage.senderId = { _id: sender._id, profile: sender.profile };
        populatedMessage.receiverId = { _id: receiver._id, profile: receiver.profile };

        // Emit real-time update via Socket.IO (INSTANT)
        const io = req.app.get('io');
        if (io) {
            emitNewMessage(io, chatId, populatedMessage);

            // Emit balance update if male (use already-available balance)
            if (req.user.role === 'male' && updatedSender) {
                emitBalanceUpdate(io, senderId, updatedSender.coinBalance);
            }

            // Emit level-up event if leveled up
            if (levelUpInfo) {
                io.to(`chat:${chatId}`).emit('intimacy:levelup', {
                    chatId,
                    levelInfo: levelUpInfo,
                });
            }
        }

        // 📲 SEND PUSH NOTIFICATION (Fire-and-Forget)
        setImmediate(() => {
            console.log('[MESSAGE] 📲 Sending push notification to receiver...');
            chatNotificationService.notifyNewMessage(receiverId, sender, {
                chatId,
                messageId: message._id,
                messageType,
                content,
                attachments,
                gifts: [] // No gifts in regular message
            }).catch(error => {
                console.error('[MESSAGE] ❌ Push notification error:', error);
            });
        });

        // Prepare Intimacy Response safely
        const finalChatState = updatedChat || chat;
        const maleParticipantRes = finalChatState.participants?.find(p => p.role === 'male');
        const maleUserIdRes = maleParticipantRes?.userId.toString();
        const intimacyInfo = maleUserIdRes ? getLevelInfo(finalChatState.messageCountByUser?.get(maleUserIdRes) || 0) : null;

        res.status(201).json({
            status: 'success',
            data: {
                message: populatedMessage,
                newBalance: req.user.role === 'male' && updatedSender ? updatedSender.coinBalance : undefined,
                levelUp: levelUpInfo,
                intimacy: intimacyInfo,
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send "Hi" message (special - only 5 coins)
 */
export const sendHiMessage = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        if (!receiverId) {
            throw new BadRequestError('Receiver ID is required');
        }

        // Check receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            throw new NotFoundError('User not found');
        }

        const sender = await User.findById(senderId);
        if (sender.blockedUsers.some(id => id.toString() === receiverId.toString())) {
            throw new BadRequestError('You have blocked this user. Unblock to send messages.');
        }
        if (receiver.blockedUsers.some(id => id.toString() === senderId.toString())) {
            throw new BadRequestError('You cannot send messages to this user as you have been blocked.');
        }

        // Find or create chat
        let chat = await Chat.findOne({
            'participants.userId': { $all: [senderId, receiverId] }
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [
                    { userId: senderId, role: req.user.role },
                    { userId: receiverId, role: receiver.role }
                ],
                isActive: true,
            });
        }

        // Validate and deduct coins
        const HI_MESSAGE_COST = await getHiMessageCost();

        // 1. Atomic Debit (Optimistic Lock)
        let updatedSender = await User.findOneAndUpdate(
            { _id: senderId, coinBalance: { $gte: HI_MESSAGE_COST } },
            { $inc: { coinBalance: -HI_MESSAGE_COST } },
            { new: true }
        );

        if (!updatedSender) {
            throw new BadRequestError('Insufficient coin balance for Hi message');
        }

        // ⚠️ Low Balance Warning (Fire-and-Forget)
        if (updatedSender.coinBalance < 50 && updatedSender.coinBalance > 0) {
            setImmediate(() => {
                chatNotificationService.notifyLowBalance(senderId, updatedSender.coinBalance)
                    .catch(e => console.error('[LOW-BALANCE] Notification failed:', e));
            });
        }

        // 2. Batch Credit to Receiver (Optimized)
        earningBatchService.addEarning(receiverId, {
            amount: HI_MESSAGE_COST,
            type: 'message_earned',
            relatedUserId: senderId,
            relatedChatId: chat._id,
            description: `"Hi" message received`,
        });

        // 3. Create Transaction Records (Async)
        Transaction.create({
            userId: senderId,
            type: 'message_spent',
            direction: 'debit',
            amountCoins: HI_MESSAGE_COST,
            status: 'completed',
            balanceAfter: updatedSender.coinBalance,
            relatedUserId: receiverId,
            relatedChatId: chat._id,
            description: `"Hi" message sent`,
        }).catch(err => console.error('[HI] Failed to save sender transaction log:', err));

        // Create "Hi" message
        const message = await Message.create({
            chatId: chat._id,
            senderId,
            receiverId,
            content: '👋 Hi!',
            messageType: 'text',
            status: 'sent'
        });

        // Perform ATOMIC Chat Update
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chat._id },
            {
                $set: {
                    lastMessage: message._id,
                    lastMessageAt: new Date(),
                    isActive: true,
                },
                $inc: {
                    totalMessageCount: 1,
                    [`messageCountByUser.${senderId}`]: 1,
                }
            },
            { new: true }
        );

        // Async Unread Count Update
        Chat.updateOne(
            { _id: chat._id, 'participants.userId': receiverId },
            { $inc: { 'participants.$.unreadCount': 1 } }
        ).catch(e => console.error('[HI] Unread count failed', e));

        // Intimacy Level Check (Async)
        let levelUpInfo = null;
        if (updatedChat) {
            const userMessageCount = updatedChat.messageCountByUser?.get(senderId.toString()) || 0;
            // Previous was current - 1
            const previousMessageCount = userMessageCount - 1;

            const levelUpCheck = checkLevelUp(previousMessageCount, userMessageCount);
            if (levelUpCheck.leveledUp) {
                // Async Level Update
                Chat.updateOne({ _id: chat._id }, {
                    $set: {
                        intimacyLevel: levelUpCheck.newLevel,
                        lastLevelUpAt: new Date()
                    }
                }).catch(e => console.error('[HI] Level update failed', e));

                levelUpInfo = levelUpCheck.newLevelInfo;
                logger.info(`🎉 Chat ${chat._id} leveled up`);
            }
        }

        // Populate message
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'profile')
            .populate('receiverId', 'profile');

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            emitNewMessage(io, chat._id.toString(), populatedMessage);
            emitBalanceUpdate(io, senderId, updatedSender.coinBalance);

            // Emit level-up event if leveled up
            if (levelUpInfo) {
                io.to(`chat:${chat._id}`).emit('intimacy:levelup', {
                    chatId: chat._id,
                    levelInfo: levelUpInfo,
                });
            }
        }

        // 📲 SEND PUSH NOTIFICATION (Fire-and-Forget)
        setImmediate(() => {
            console.log('[HI-MESSAGE] 📲 Sending push notification to receiver...');
            chatNotificationService.notifyNewMessage(receiverId, sender, {
                chatId: chat._id,
                messageId: message._id,
                messageType: 'text',
                content: '👋 Hi!',
                attachments: [],
                gifts: []
            }).catch(error => {
                console.error('[HI-MESSAGE] ❌ Push notification error:', error);
            });
        });

        res.status(201).json({
            status: 'success',
            data: {
                message: populatedMessage,
                chatId: chat._id,
                newBalance: updatedSender.coinBalance,
                coinsSpent: HI_MESSAGE_COST,
                levelUp: levelUpInfo,
                intimacy: getLevelInfo(updatedChat.messageCountByUser?.get(senderId.toString()) || 0),
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send one or more gifts
 */
export const sendGift = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { chatId, giftIds, content } = req.body; // Added content for custom note

        if (!giftIds || !Array.isArray(giftIds) || giftIds.length === 0) {
            throw new BadRequestError('At least one Gift ID is required');
        }

        // Verify chat
        const chat = await Chat.findOne({
            _id: chatId,
            'participants.userId': senderId
        });

        if (!chat) {
            throw new NotFoundError('Chat not found');
        }

        // Get gifts
        const gifts = await Gift.find({ _id: { $in: giftIds }, isActive: true });
        if (gifts.length === 0) {
            throw new NotFoundError('Gifts not found');
        }

        // Calculate total cost
        const totalCost = gifts.reduce((sum, gift) => sum + gift.cost, 0);

        // Get receiver
        const otherParticipant = chat.participants.find(
            p => p.userId.toString() !== senderId
        );
        const receiverId = otherParticipant.userId;

        // Block check
        const [sender, receiver] = await Promise.all([
            User.findById(senderId).select('blockedUsers coinBalance profile'),
            User.findById(receiverId).select('blockedUsers profile')
        ]);

        if (sender.blockedUsers.some(id => id.toString() === receiverId.toString())) {
            throw new BadRequestError('You have blocked this user. Unblock to send gifts.');
        }
        if (receiver.blockedUsers.some(id => id.toString() === senderId.toString())) {
            throw new BadRequestError('You cannot send gifts to this user as you have been blocked.');
        }

        // 1. Atomic Debit
        let updatedSender = await User.findOneAndUpdate(
            { _id: senderId, coinBalance: { $gte: totalCost } },
            { $inc: { coinBalance: -totalCost } },
            { new: true }
        );

        if (!updatedSender) {
            throw new BadRequestError('Insufficient coin balance for gifts');
        }

        // ⚠️ Low Balance Warning (Fire-and-Forget)
        if (updatedSender.coinBalance < 50 && updatedSender.coinBalance > 0) {
            setImmediate(() => {
                chatNotificationService.notifyLowBalance(senderId, updatedSender.coinBalance)
                    .catch(e => console.error('[LOW-BALANCE] Notification failed:', e));
            });
        }

        // 2. Batch Credit to Receiver (Optimized)
        earningBatchService.addEarning(receiverId, {
            amount: totalCost,
            type: 'gift_received',
            relatedUserId: senderId,
            relatedChatId: chatId,
            description: `Received ${gifts.length} gifts from user`,
        });

        // 3. Create Debit Transaction Record for Sender (Immediate)
        Transaction.create({
            userId: senderId,
            type: 'gift_sent',
            direction: 'debit',
            amountCoins: totalCost,
            status: 'completed',
            balanceAfter: updatedSender.coinBalance,
            relatedUserId: receiverId,
            relatedChatId: chatId,
            description: `Sent ${gifts.length} gifts: ${gifts.map(g => g.name).join(', ')}`,
        }).catch(err => console.error('[GIFT] Failed to save sender transaction log:', err));

        // Create gift message
        const messageGifts = gifts.map(gift => ({
            giftId: gift._id,
            giftName: gift.name,
            giftCost: gift.cost,
            giftImage: gift.imageUrl,
        }));

        const message = await Message.create({
            chatId,
            senderId,
            receiverId,
            content: content || `Sent ${gifts.length} gift${gifts.length > 1 ? 's' : ''}`,
            messageType: 'gift',
            gifts: messageGifts,
            status: 'sent'
        });

        // Perform ATOMIC Chat Update
        // Gifts update counts +1 ? (Preserving existing logic)
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId },
            {
                $set: {
                    lastMessage: message._id,
                    lastMessageAt: new Date(),
                    isActive: true,
                },
                $inc: {
                    totalMessageCount: 1,
                    [`messageCountByUser.${senderId}`]: 1,
                }
            },
            { new: true }
        );

        // Async Unread Count Update
        Chat.updateOne(
            { _id: chatId, 'participants.userId': receiverId },
            { $inc: { 'participants.$.unreadCount': 1 } }
        ).catch(e => console.error('[GIFT] Unread count failed', e));

        // Intimacy Level Check (Async)
        let levelUpInfo = null;
        if (updatedChat) {
            const userMessageCount = updatedChat.messageCountByUser?.get(senderId.toString()) || 0;
            const previousMessageCount = userMessageCount - 1;

            const levelUpCheck = checkLevelUp(previousMessageCount, userMessageCount);
            if (levelUpCheck.leveledUp) {
                // Async Level Update
                Chat.updateOne({ _id: chatId }, {
                    $set: {
                        intimacyLevel: levelUpCheck.newLevel,
                        lastLevelUpAt: new Date()
                    }
                }).catch(e => console.error('[GIFT] Level update failed', e));

                levelUpInfo = levelUpCheck.newLevelInfo;
                logger.info(`🎉 Chat ${chatId} leveled up`);
            }
        }


        // Populate message
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'profile')
            .populate('receiverId', 'profile');

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            emitNewMessage(io, chatId, populatedMessage);
            emitBalanceUpdate(io, senderId, updatedSender.coinBalance);

            // Emit level-up event if leveled up
            if (levelUpInfo) {
                io.to(`chat:${chatId}`).emit('intimacy:levelup', {
                    chatId,
                    levelInfo: levelUpInfo,
                });
            }
        }

        // 📲 SEND PUSH NOTIFICATION FOR GIFT (Fire-and-Forget)
        setImmediate(() => {
            console.log('[GIFT] 📲 Sending push notification to receiver...');
            chatNotificationService.notifyNewMessage(receiverId, sender, {
                chatId,
                messageId: message._id,
                messageType: 'gift',
                content: message.content,
                attachments: [],
                gifts: messageGifts // Include gift details
            }).catch(error => {
                console.error('[GIFT] ❌ Push notification error:', error);
            });
        });

        res.status(201).json({
            status: 'success',
            data: {
                message: populatedMessage,
                newBalance: updatedSender.coinBalance,
                coinsSpent: totalCost,
                levelUp: levelUpInfo,
                intimacy: getLevelInfo(updatedChat.messageCountByUser?.get(senderId.toString()) || 0),
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get gift history for the current user
 */
export const getGiftHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetch gift_sent transactions for the user
        const transactions = await Transaction.find({
            userId,
            type: 'gift_sent',
            status: 'completed'
        })
            .sort({ createdAt: -1 })
            .populate('relatedUserId', 'profile')
            .lean();

        // Map to a cleaner format for the frontend
        const history = transactions.map(tx => ({
            id: tx._id,
            giftName: tx.description.replace('Sent gifts: ', '').replace('Sent 1 gift: ', ''),
            recipientId: tx.relatedUserId?._id,
            recipientName: tx.relatedUserId?.profile?.name || 'User',
            recipientAvatar: tx.relatedUserId?.profile?.photos?.find(p => p.isPrimary)?.url || tx.relatedUserId?.profile?.photos?.[0]?.url || '',
            sentAt: tx.createdAt,
            cost: tx.amountCoins,
            // We might need to fetch the actual message if we want the custom note
        }));

        res.status(200).json({
            status: 'success',
            data: {
                history,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get available gifts - with caching
 */
export const getGifts = async (req, res, next) => {
    try {
        // Try cache first
        const { default: memoryCache, CACHE_KEYS, CACHE_TTL } = await import('../../core/cache/memoryCache.js');

        let gifts = memoryCache.get(CACHE_KEYS.GIFTS);

        if (!gifts) {
            // Cache miss - fetch from DB
            gifts = await Gift.find({ isActive: true })
                .sort({ displayOrder: 1, cost: 1 })
                .select('name category imageUrl cost description displayOrder')
                .lean();

            // Store in cache
            memoryCache.set(CACHE_KEYS.GIFTS, gifts, CACHE_TTL.STATIC);
        }

        res.status(200).json({
            status: 'success',
            data: {
                gifts,
            },
        });
    } catch (error) {
        next(error);
    }
};
