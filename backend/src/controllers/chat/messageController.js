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
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import transactionManager from '../../core/transactions/transactionManager.js';
import dataValidation from '../../core/validation/dataValidation.js';
import logger from '../../utils/logger.js';
import { checkLevelUp, getLevelInfo } from '../../utils/intimacyLevel.js';

// Message costs (can be moved to config)
const MESSAGE_COST = 50; // coins per message
const HI_MESSAGE_COST = 5; // coins for "Send Hi"


/**
 * Send a text message
 */
export const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { chatId, content } = req.body;

        if (!content || content.trim().length === 0) {
            throw new BadRequestError('Message content is required');
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

        // If sender is male, deduct coins
        let transaction = null;
        if (req.user.role === 'male') {
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
                        type: 'message_spent',
                        direction: 'debit',
                        amountCoins: MESSAGE_COST,
                        status: 'completed',
                        balanceBefore,
                        balanceAfter: sender.coinBalance,
                        relatedUserId: receiverId,
                        relatedChatId: chatId,
                        description: `Message sent to user`,
                    }], { session });

                    // Credit coins to receiver (female)
                    const receiver = await User.findById(receiverId).session(session);
                    const receiverBalanceBefore = receiver.coinBalance;
                    receiver.coinBalance += MESSAGE_COST;
                    await receiver.save({ session });

                    // Create transaction record for receiver
                    await Transaction.create([{
                        userId: receiverId,
                        type: 'message_earned',
                        direction: 'credit',
                        amountCoins: MESSAGE_COST,
                        status: 'completed',
                        balanceBefore: receiverBalanceBefore,
                        balanceAfter: receiver.coinBalance,
                        relatedUserId: senderId,
                        relatedChatId: chatId,
                        description: `Message received from user`,
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
            content,
            messageType: 'text',
            status: 'sent',
            transactionId: transaction?._id,
        });

        // Update chat with intimacy tracking
        const previousTotalMessages = chat.totalMessageCount || 0;
        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.incrementUnread(senderId);

        // Track message count for intimacy level
        chat.totalMessageCount = (chat.totalMessageCount || 0) + 1;
        const userMessageCount = (chat.messageCountByUser?.get(senderId.toString()) || 0) + 1;
        if (!chat.messageCountByUser) {
            chat.messageCountByUser = new Map();
        }
        chat.messageCountByUser.set(senderId.toString(), userMessageCount);

        // Check for level up
        const levelUpCheck = checkLevelUp(previousTotalMessages, chat.totalMessageCount);
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

        // Emit real-time update via Socket.IO
        const io = req.app.get('io');
        if (io) {
            const { emitNewMessage, emitBalanceUpdate } = await import('../../socket/index.js');
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
                intimacy: getLevelInfo(chat.totalMessageCount),
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
        const previousTotalMessages = chat.totalMessageCount || 0;
        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.incrementUnread(senderId);

        // Track message count for intimacy level
        chat.totalMessageCount = (chat.totalMessageCount || 0) + 1;
        const userMessageCount = (chat.messageCountByUser?.get(senderId.toString()) || 0) + 1;
        if (!chat.messageCountByUser) {
            chat.messageCountByUser = new Map();
        }
        chat.messageCountByUser.set(senderId.toString(), userMessageCount);

        // Check for level up
        const levelUpCheck = checkLevelUp(previousTotalMessages, chat.totalMessageCount);
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
            const { emitNewMessage, emitBalanceUpdate } = await import('../../socket/index.js');
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
                intimacy: getLevelInfo(chat.totalMessageCount),
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send a gift
 */
export const sendGift = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { chatId, giftId } = req.body;

        if (!giftId) {
            throw new BadRequestError('Gift ID is required');
        }

        // Verify chat
        const chat = await Chat.findOne({
            _id: chatId,
            'participants.userId': senderId
        });

        if (!chat) {
            throw new NotFoundError('Chat not found');
        }

        // Get gift
        const gift = await Gift.findOne({ _id: giftId, isActive: true });
        if (!gift) {
            throw new NotFoundError('Gift not found');
        }

        // Get receiver
        const otherParticipant = chat.participants.find(
            p => p.userId.toString() !== senderId
        );
        const receiverId = otherParticipant.userId;

        // Validate and deduct coins
        await dataValidation.validateMessageSend(senderId, gift.cost);

        // Execute atomic transaction
        const result = await transactionManager.executeTransaction([
            async (session) => {
                // Deduct coins from sender
                const sender = await User.findById(senderId).session(session);
                const balanceBefore = sender.coinBalance;
                sender.coinBalance -= gift.cost;
                await sender.save({ session });

                // Create transaction for sender
                const senderTx = await Transaction.create([{
                    userId: senderId,
                    type: 'gift_sent',
                    direction: 'debit',
                    amountCoins: gift.cost,
                    status: 'completed',
                    balanceBefore,
                    balanceAfter: sender.coinBalance,
                    relatedUserId: receiverId,
                    relatedChatId: chatId,
                    description: `Sent ${gift.name} gift`,
                }], { session });

                // Credit coins to receiver
                const receiver = await User.findById(receiverId).session(session);
                const receiverBalanceBefore = receiver.coinBalance;
                receiver.coinBalance += gift.cost;
                await receiver.save({ session });

                // Create transaction for receiver
                await Transaction.create([{
                    userId: receiverId,
                    type: 'gift_received',
                    direction: 'credit',
                    amountCoins: gift.cost,
                    status: 'completed',
                    balanceBefore: receiverBalanceBefore,
                    balanceAfter: receiver.coinBalance,
                    relatedUserId: senderId,
                    relatedChatId: chatId,
                    description: `Received ${gift.name} gift`,
                }], { session });

                return { senderTx: senderTx[0], newBalance: sender.coinBalance };
            }
        ]);

        // Create gift message
        const message = await Message.create({
            chatId,
            senderId,
            receiverId,
            content: `Sent a ${gift.name}`,
            messageType: 'gift',
            gift: {
                giftId: gift._id,
                giftName: gift.name,
                giftCost: gift.cost,
                giftImage: gift.imageUrl,
            },
            status: 'sent',
            transactionId: result.senderTx._id,
        });

        // Update chat with intimacy tracking
        const previousTotalMessages = chat.totalMessageCount || 0;
        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        await chat.incrementUnread(senderId);

        // Track message count for intimacy level
        chat.totalMessageCount = (chat.totalMessageCount || 0) + 1;
        const userMessageCount = (chat.messageCountByUser?.get(senderId.toString()) || 0) + 1;
        if (!chat.messageCountByUser) {
            chat.messageCountByUser = new Map();
        }
        chat.messageCountByUser.set(senderId.toString(), userMessageCount);

        // Check for level up
        const levelUpCheck = checkLevelUp(previousTotalMessages, chat.totalMessageCount);
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
            const { emitNewMessage, emitBalanceUpdate } = await import('../../socket/index.js');
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
                coinsSpent: gift.cost,
                levelUp: levelUpInfo,
                intimacy: getLevelInfo(chat.totalMessageCount),
            }
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
