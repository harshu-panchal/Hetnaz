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

        // Get receiver
        const otherParticipant = chat.participants.find(
            p => p.userId.toString() !== senderId
        );
        const receiverId = otherParticipant.userId;

        // Block check
        const [sender, receiver] = await Promise.all([
            User.findById(senderId).select('blockedUsers memberTier profile'),
            User.findById(receiverId).select('blockedUsers profile')
        ]);

        if (sender.blockedUsers.some(id => id.toString() === receiverId.toString())) {
            throw new BadRequestError('You have blocked this user. Unblock to send messages.');
        }
        if (receiver.blockedUsers.some(id => id.toString() === senderId.toString())) {
            throw new BadRequestError('You cannot send messages to this user as you have been blocked.');
        }

        // If sender is male, deduct coins
        let transaction = null;
        if (req.user.role === 'male') {
            // Get message cost based on type
            const MESSAGE_COST = await (messageType === 'image' ? getImageMessageCost() : getMessageCost(sender.memberTier));

            // Validate user has enough coins
            await dataValidation.validateMessageSend(senderId, MESSAGE_COST);

            // Execute atomic transaction
            const result = await transactionManager.executeTransaction([
                async (session) => {
                    // Deduct coins from sender
                    const sender = await User.findById(senderId).session(session);
                    const balanceBefore = sender.coinBalance;
                    sender.coinBalance -= MESSAGE_COST;
                    await sender.save({ session });

                    // Create transaction record for sender
                    const senderTx = await Transaction.create([{
                        userId: senderId,
                        type: messageType === 'image' ? 'image_spent' : 'message_spent',
                        direction: 'debit',
                        amountCoins: MESSAGE_COST,
                        status: 'completed',
                        balanceBefore,
                        balanceAfter: sender.coinBalance,
                        relatedUserId: receiverId,
                        relatedChatId: chatId,
                        description: `${messageType === 'image' ? 'Image' : 'Message'} sent to user`,
                    }], { session });

                    // Credit coins to receiver (female)
                    const receiver = await User.findById(receiverId).session(session);
                    const receiverBalanceBefore = receiver.coinBalance;
                    receiver.coinBalance += MESSAGE_COST;
                    await receiver.save({ session });

                    // Create transaction record for receiver
                    await Transaction.create([{
                        userId: receiverId,
                        type: messageType === 'image' ? 'image_earned' : 'message_earned',
                        direction: 'credit',
                        amountCoins: MESSAGE_COST,
                        status: 'completed',
                        balanceBefore: receiverBalanceBefore,
                        balanceAfter: receiver.coinBalance,
                        relatedUserId: senderId,
                        relatedChatId: chatId,
                        description: `${messageType === 'image' ? 'Image' : 'Message'} received from user`,
                    }], { session });

                    return { senderTx: senderTx[0], newBalance: sender.coinBalance };
                }
            ]);

            transaction = result.senderTx;
        }

        // Create message
        const message = await Message.create({
            chatId,
            senderId,
            receiverId,
            content: content || '',
            messageType,
            attachments,
            status: 'sent',
            transactionId: transaction?._id,
        });

        // Update chat with intimacy tracking
        // Only count MALE messages for intimacy level progression
        const maleParticipant = chat.participants.find(p => p.role === 'male');
        const maleUserId = maleParticipant?.userId.toString();

        // Get current male message count
        const previousMaleMessages = maleUserId ? (chat.messageCountByUser?.get(maleUserId) || 0) : 0;

        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.incrementUnread(senderId);

        // Track message count per user
        // Images contribute 2 points to intimacy, regular messages 1
        const intensityPoints = (messageType === 'image') ? 2 : 1;
        chat.totalMessageCount = (chat.totalMessageCount || 0) + intensityPoints;

        const userMessageCount = (chat.messageCountByUser?.get(senderId.toString()) || 0) + intensityPoints;
        if (!chat.messageCountByUser) {
            chat.messageCountByUser = new Map();
        }
        chat.messageCountByUser.set(senderId.toString(), userMessageCount);

        // Check for level up ONLY based on male messages
        let levelUpInfo = null;
        if (req.user.role === 'male') {
            const newMaleMessages = userMessageCount; // Current sender is male
            const levelUpCheck = checkLevelUp(previousMaleMessages, newMaleMessages);
            if (levelUpCheck.leveledUp) {
                chat.intimacyLevel = levelUpCheck.newLevel;
                chat.lastLevelUpAt = new Date();
                levelUpInfo = levelUpCheck.newLevelInfo;
                logger.info(`🎉 Chat ${chatId} leveled up: ${levelUpCheck.previousLevel} → ${levelUpCheck.newLevel}`);
            }
        }

        await chat.save();

        // Populate message  
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'profile')
            .populate('receiverId', 'profile');

        // Emit real-time update via Socket.IO
        const io = req.app.get('io');
        if (io) {
            emitNewMessage(io, chatId, populatedMessage);

            // Emit balance update if male
            if (req.user.role === 'male') {
                const newBalance = (await User.findById(senderId)).coinBalance;
                emitBalanceUpdate(io, senderId, newBalance);
            }

            // Emit level-up event if leveled up
            if (levelUpInfo) {
                io.to(`chat:${chatId}`).emit('intimacy:levelup', {
                    chatId,
                    levelInfo: levelUpInfo,
                });
            }
        }

        res.status(201).json({
            status: 'success',
            data: {
                message: populatedMessage,
                newBalance: req.user.role === 'male' ? (await User.findById(senderId)).coinBalance : undefined,
                levelUp: levelUpInfo,
                intimacy: maleUserId ? getLevelInfo(chat.messageCountByUser.get(maleUserId) || 0) : null,
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
        await dataValidation.validateMessageSend(senderId, HI_MESSAGE_COST);

        // Execute atomic transaction
        const result = await transactionManager.executeTransaction([
            async (session) => {
                // Deduct coins from sender
                const sender = await User.findById(senderId).session(session);
                const balanceBefore = sender.coinBalance;
                sender.coinBalance -= HI_MESSAGE_COST;
                await sender.save({ session });

                // Create transaction record for sender
                const senderTx = await Transaction.create([{
                    userId: senderId,
                    type: 'message_spent',
                    direction: 'debit',
                    amountCoins: HI_MESSAGE_COST,
                    status: 'completed',
                    balanceBefore,
                    balanceAfter: sender.coinBalance,
                    relatedUserId: receiverId,
                    relatedChatId: chat._id,
                    description: `"Hi" message sent`,
                }], { session });

                // Credit coins to receiver
                const rec = await User.findById(receiverId).session(session);
                const receiverBalanceBefore = rec.coinBalance;
                rec.coinBalance += HI_MESSAGE_COST;
                await rec.save({ session });

                // Create transaction record for receiver
                await Transaction.create([{
                    userId: receiverId,
                    type: 'message_earned',
                    direction: 'credit',
                    amountCoins: HI_MESSAGE_COST,
                    status: 'completed',
                    balanceBefore: receiverBalanceBefore,
                    balanceAfter: rec.coinBalance,
                    relatedUserId: senderId,
                    relatedChatId: chat._id,
                    description: `"Hi" message received`,
                }], { session });

                return { senderTx: senderTx[0], newBalance: sender.coinBalance };
            }
        ]);

        // Create "Hi" message
        const message = await Message.create({
            chatId: chat._id,
            senderId,
            receiverId,
            content: '👋 Hi!',
            messageType: 'text',
            status: 'sent',
            transactionId: result.senderTx._id,
        });

        // Update chat with intimacy tracking
        // Only count MALE messages for intimacy level progression
        const maleParticipant = chat.participants.find(p => p.role === 'male');
        const maleUserId = maleParticipant?.userId.toString();

        // Get current male message count (sender is always male for Hi message)
        const previousMaleMessages = chat.messageCountByUser?.get(senderId.toString()) || 0;

        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.incrementUnread(senderId);

        // Track message count per user
        chat.totalMessageCount = (chat.totalMessageCount || 0) + 1;
        const userMessageCount = (chat.messageCountByUser?.get(senderId.toString()) || 0) + 1;
        if (!chat.messageCountByUser) {
            chat.messageCountByUser = new Map();
        }
        chat.messageCountByUser.set(senderId.toString(), userMessageCount);

        // Check for level up based on male messages
        const levelUpCheck = checkLevelUp(previousMaleMessages, userMessageCount);
        let levelUpInfo = null;
        if (levelUpCheck.leveledUp) {
            chat.intimacyLevel = levelUpCheck.newLevel;
            chat.lastLevelUpAt = new Date();
            levelUpInfo = levelUpCheck.newLevelInfo;
            logger.info(`🎉 Chat ${chat._id} leveled up: ${levelUpCheck.previousLevel} → ${levelUpCheck.newLevel}`);
        }

        await chat.save();

        // Populate message
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'profile')
            .populate('receiverId', 'profile');

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            emitNewMessage(io, chat._id.toString(), populatedMessage);
            emitBalanceUpdate(io, senderId, result.newBalance);

            // Emit level-up event if leveled up
            if (levelUpInfo) {
                io.to(`chat:${chat._id}`).emit('intimacy:levelup', {
                    chatId: chat._id,
                    levelInfo: levelUpInfo,
                });
            }
        }

        res.status(201).json({
            status: 'success',
            data: {
                message: populatedMessage,
                chatId: chat._id,
                newBalance: result.newBalance,
                coinsSpent: HI_MESSAGE_COST,
                levelUp: levelUpInfo,
                intimacy: getLevelInfo(userMessageCount),
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

        // Validate and deduct coins
        await dataValidation.validateMessageSend(senderId, totalCost);

        // Execute atomic transaction
        const result = await transactionManager.executeTransaction([
            async (session) => {
                // Deduct coins from sender
                const sender = await User.findById(senderId).session(session);
                const balanceBefore = sender.coinBalance;
                sender.coinBalance -= totalCost;
                await sender.save({ session });

                // Create transaction for sender
                const senderTx = await Transaction.create([{
                    userId: senderId,
                    type: 'gift_sent',
                    direction: 'debit',
                    amountCoins: totalCost,
                    status: 'completed',
                    balanceBefore,
                    balanceAfter: sender.coinBalance,
                    relatedUserId: receiverId,
                    relatedChatId: chatId,
                    description: `Sent ${gifts.length} gifts: ${gifts.map(g => g.name).join(', ')}`,
                }], { session });

                // Credit coins to receiver
                const receiver = await User.findById(receiverId).session(session);
                const receiverBalanceBefore = receiver.coinBalance;
                receiver.coinBalance += totalCost;
                await receiver.save({ session });

                // Create transaction for receiver
                await Transaction.create([{
                    userId: receiverId,
                    type: 'gift_received',
                    direction: 'credit',
                    amountCoins: totalCost,
                    status: 'completed',
                    balanceBefore: receiverBalanceBefore,
                    balanceAfter: receiver.coinBalance,
                    relatedUserId: senderId,
                    relatedChatId: chatId,
                    description: `Received ${gifts.length} gifts from user`,
                }], { session });

                return { senderTx: senderTx[0], newBalance: sender.coinBalance };
            }
        ]);

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
            status: 'sent',
            transactionId: result.senderTx._id,
        });

        // Update chat with intimacy tracking
        // Only count MALE messages for intimacy level progression (sender is always male for gifts)
        const maleParticipant = chat.participants.find(p => p.role === 'male');
        const maleUserId = maleParticipant?.userId.toString();

        // Get current male message count
        const previousMaleMessages = chat.messageCountByUser?.get(senderId.toString()) || 0;

        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.incrementUnread(senderId);

        // Track message count per user
        chat.totalMessageCount = (chat.totalMessageCount || 0) + 1;
        const userMessageCount = (chat.messageCountByUser?.get(senderId.toString()) || 0) + 1;
        if (!chat.messageCountByUser) {
            chat.messageCountByUser = new Map();
        }
        chat.messageCountByUser.set(senderId.toString(), userMessageCount);

        // Check for level up based on male messages
        const levelUpCheck = checkLevelUp(previousMaleMessages, userMessageCount);
        let levelUpInfo = null;
        if (levelUpCheck.leveledUp) {
            chat.intimacyLevel = levelUpCheck.newLevel;
            chat.lastLevelUpAt = new Date();
            levelUpInfo = levelUpCheck.newLevelInfo;
            logger.info(`🎉 Chat ${chatId} leveled up: ${levelUpCheck.previousLevel} → ${levelUpCheck.newLevel}`);
        }

        await chat.save();

        // Populate message
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'profile')
            .populate('receiverId', 'profile');

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            emitNewMessage(io, chatId, populatedMessage);
            emitBalanceUpdate(io, senderId, result.newBalance);

            // Emit level-up event if leveled up
            if (levelUpInfo) {
                io.to(`chat:${chatId}`).emit('intimacy:levelup', {
                    chatId,
                    levelInfo: levelUpInfo,
                });
            }
        }

        res.status(201).json({
            status: 'success',
            data: {
                message: populatedMessage,
                newBalance: result.newBalance,
                coinsSpent: totalCost,
                levelUp: levelUpInfo,
                intimacy: getLevelInfo(userMessageCount),
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
