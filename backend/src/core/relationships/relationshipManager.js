/**
 * Relationship Manager - Data Normalization & Consistency
 * @owner: Sujal (Shared - Both review)
 * @purpose: Maintain data consistency across related documents
 * 
 * Handles:
 * - Cascading updates
 * - Referential integrity
 * - Data synchronization
 * - Relationship validation
 */

import User from '../../models/User.js';
import Chat from '../../models/Chat.js';
import Message from '../../models/Message.js';
import Transaction from '../../models/Transaction.js';
import Withdrawal from '../../models/Withdrawal.js';
import Notification from '../../models/Notification.js';
import logger from '../../utils/logger.js';

class RelationshipManager {
  /**
   * Update user coin balance and create transaction atomically
   * Ensures: User.coinBalance === sum of all transactions
   */
  async updateUserBalanceWithTransaction(userId, transactionData, session) {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    const balanceBefore = user.coinBalance;
    let balanceAfter;

    if (transactionData.direction === 'credit') {
      balanceAfter = balanceBefore + transactionData.amountCoins;
    } else {
      if (balanceBefore < transactionData.amountCoins) {
        throw new Error('Insufficient balance');
      }
      balanceAfter = balanceBefore - transactionData.amountCoins;
      // Increment totalCoinsSpent for male users
      if (user.role === 'male') {
        user.totalCoinsSpent = (user.totalCoinsSpent || 0) + transactionData.amountCoins;
        
        try {
          const AppSettings = (await import('../../models/AppSettings.js')).default;
          const { invalidateUserCache } = await import('../../middleware/auth.js');
          const settings = await AppSettings.getSettings();
          const activeLevels = (settings.maleLevels || [])
            .filter(lvl => user.totalCoinsSpent >= lvl.minCoinsSpent);

          user.badges = user.badges || [];
          activeLevels.forEach(lvl => {
            const badgeId = `level_${lvl.level}`;
            const hasBadge = user.badges.some(b => b.id === badgeId);
            if (!hasBadge) {
              user.badges.push({
                id: badgeId,
                name: `${lvl.badgeName} Status`,
                icon: 'military_tech',
                category: 'achievement',
                isUnlocked: true,
                unlockedAt: new Date()
              });
            }
          });
          
          invalidateUserCache(user._id || user.id);
        } catch (err) {
          logger.error(`Error in dynamic badge unlock: ${err.message}`);
        }
      }
    }

    // Create transaction
    const transaction = await Transaction.create([{
      ...transactionData,
      balanceBefore,
      balanceAfter,
    }], { session });

    // Update user balance
    user.coinBalance = balanceAfter;
    await user.save({ session });

    return { transaction: transaction[0], user };
  }

  /**
   * When message is sent, update:
   * - Chat.lastMessage
   * - Chat.lastMessageAt
   * - Chat participants unreadCount
   * - User coin balance (if male)
   * - Create transaction
   */
  async handleMessageSent(messageData, session) {
    const { chatId, senderId, receiverId, messageId } = messageData;

    // Update chat
    const chat = await Chat.findById(chatId).session(session);
    if (chat) {
      chat.lastMessage = messageId;
      chat.lastMessageAt = new Date();
      
      // Increment unread count for receiver
      const receiverParticipant = chat.participants.find(
        p => p.userId.toString() === receiverId.toString()
      );
      if (receiverParticipant) {
        receiverParticipant.unreadCount += 1;
      }

      await chat.save({ session });
    }

    // Update sender's last activity
    await User.findByIdAndUpdate(
      senderId,
      { lastSeen: new Date() },
      { session }
    );

    return chat;
  }

  /**
   * When message is read, update:
   * - Chat participant lastReadAt
   * - Chat participant unreadCount = 0
   * - Message readAt
   */
  async handleMessageRead(chatId, userId, messageIds, session) {
    const chat = await Chat.findById(chatId).session(session);
    if (!chat) throw new Error('Chat not found');

    const participant = chat.participants.find(
      p => p.userId.toString() === userId.toString()
    );

    if (participant) {
      participant.lastReadAt = new Date();
      participant.unreadCount = 0;
      await chat.save({ session });
    }

    // Mark messages as read
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { 
        readAt: new Date(),
        status: 'read'
      },
      { session }
    );

    return chat;
  }

  /**
   * When user goes online/offline, update:
   * - User.isOnline
   * - User.lastSeen
   * - User.socketId
   */
  async handleUserOnlineStatus(userId, isOnline, socketId = null, session = null) {
    const update = {
      isOnline,
      lastSeen: new Date(),
    };

    if (socketId !== null) {
      update.socketId = socketId;
    }

    const options = session ? { session } : {};
    return await User.findByIdAndUpdate(userId, update, options);
  }

  /**
   * When profile photo is updated, ensure:
   * - Only one primary photo
   * - Old primary is unset
   */
  async handleProfilePhotoUpdate(userId, newPrimaryPhotoUrl, session) {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    // Unset all existing primary photos
    if (user.profile?.photos) {
      user.profile.photos.forEach(photo => {
        if (photo.isPrimary) {
          photo.isPrimary = false;
        }
      });
    }

    // Set new primary
    const photo = user.profile?.photos?.find(p => p.url === newPrimaryPhotoUrl);
    if (photo) {
      photo.isPrimary = true;
    }

    await user.save({ session });
    return user;
  }

  /**
   * When withdrawal is approved, update:
   * - Withdrawal status
   * - User coin balance
   * - Create transaction
   * - Create notification
   */
  async handleWithdrawalApproval(withdrawalId, adminId, session) {
    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal) throw new Error('Withdrawal not found');

    // Deduct coins from user
    const user = await User.findById(withdrawal.userId).session(session);
    if (user.coinBalance < withdrawal.coinsRequested) {
      throw new Error('Insufficient balance for withdrawal');
    }

    // Create transaction
    const transaction = await Transaction.create([{
      userId: withdrawal.userId,
      type: 'withdrawal',
      direction: 'debit',
      amountCoins: withdrawal.coinsRequested,
      amountINR: withdrawal.netPayoutAmount,
      relatedWithdrawalId: withdrawalId,
      status: 'completed',
      description: `Withdrawal of ${withdrawal.coinsRequested} coins`,
    }], { session });

    // Update user balance
    user.coinBalance -= withdrawal.coinsRequested;
    await user.save({ session });

    // Update withdrawal
    withdrawal.status = 'approved';
    withdrawal.reviewedBy = adminId;
    withdrawal.reviewedAt = new Date();
    withdrawal.transactionId = transaction[0]._id;
    await withdrawal.save({ session });

    // Create notification
    await Notification.create([{
      userId: withdrawal.userId,
      type: 'withdrawal',
      title: 'Withdrawal Approved',
      message: `Your withdrawal request of ₹${withdrawal.netPayoutAmount} has been approved`,
      actionUrl: `/female/withdrawals`,
    }], { session });

    return { withdrawal, transaction: transaction[0] };
  }

  /**
   * When female user is approved, update:
   * - User.approvalStatus
   - User.isVerified
   * - Create notification
   */
  async handleFemaleApproval(userId, adminId, session) {
    const user = await User.findById(userId).session(session);
    if (!user || user.role !== 'female') {
      throw new Error('Invalid user for approval');
    }

    user.approvalStatus = 'approved';
    user.isVerified = true;
    user.approvalReviewedBy = adminId;
    user.approvalReviewedAt = new Date();
    await user.save({ session });

    // Create notification
    await Notification.create([{
      userId,
      type: 'system',
      title: 'Account Approved',
      message: 'Your account has been approved. You can now use all features.',
      actionUrl: '/female/dashboard',
    }], { session });

    return user;
  }

  /**
   * When chat is deleted, update:
   * - Chat.isActive = false
   * - Chat.deletedBy array
   * - Mark all messages as deleted (soft delete)
   */
  async handleChatDeletion(chatId, userId, session) {
    const chat = await Chat.findById(chatId).session(session);
    if (!chat) throw new Error('Chat not found');

    // Add to deletedBy array
    chat.deletedBy.push({
      userId,
      deletedAt: new Date(),
    });

    // Check if both participants deleted
    const bothDeleted = chat.deletedBy.length >= 2;
    if (bothDeleted) {
      chat.isActive = false;
    }

    await chat.save({ session });

    // Soft delete messages if both deleted
    if (bothDeleted) {
      await Message.updateMany(
        { chatId },
        { 
          isDeleted: true,
          deletedAt: new Date()
        },
        { session }
      );
    }

    return chat;
  }

  /**
   * Validate referential integrity
   * Check if all referenced documents exist
   */
  async validateReferences(data, references) {
    const errors = [];

    for (const ref of references) {
      const { model, field, value, message } = ref;
      if (value) {
        const exists = await model.findById(value);
        if (!exists) {
          errors.push(message || `${field} reference is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Referential integrity violation: ${errors.join(', ')}`);
    }
  }

  /**
   * Recalculate derived data
   * Ensures consistency when source data changes
   */
  async recalculateUserStats(userId, session) {
    const user = await User.findById(userId).session(session);
    if (!user) return;

    // Recalculate total transactions
    const transactionCount = await Transaction.countDocuments(
      { userId },
      { session }
    );

    // Recalculate total earnings (for female users)
    if (user.role === 'female') {
      const totalEarned = await Transaction.aggregate([
        { $match: { userId: user._id, direction: 'credit' } },
        { $group: { _id: null, total: { $sum: '$amountCoins' } } }
      ], { session });

      // Store in user metadata if needed
      // This ensures consistency
    }

    return { transactionCount };
  }

  /**
   * Cascade delete handler
   * When parent is deleted, handle children
   */
  async handleCascadeDelete(parentId, parentType, session) {
    switch (parentType) {
      case 'user':
        // Soft delete: Mark chats as inactive
        await Chat.updateMany(
          { 'participants.userId': parentId },
          { isActive: false },
          { session }
        );
        // Mark messages as deleted
        await Message.updateMany(
          { $or: [{ senderId: parentId }, { receiverId: parentId }] },
          { isDeleted: true, deletedAt: new Date() },
          { session }
        );
        break;

      case 'chat':
        // Mark all messages as deleted
        await Message.updateMany(
          { chatId: parentId },
          { isDeleted: true, deletedAt: new Date() },
          { session }
        );
        break;

      default:
        logger.warn(`No cascade delete handler for type: ${parentType}`);
    }
  }
}

export default new RelationshipManager();

