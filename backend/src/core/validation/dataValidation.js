/**
 * Data Validation Layer
 * @owner: Sujal (Shared - Both review)
 * @purpose: Validate data before operations
 * 
 * Ensures:
 * - Referential integrity
 * - Business rule compliance
 * - Data format correctness
 */

import User from '../../models/User.js';
import Chat from '../../models/Chat.js';
import Message from '../../models/Message.js';
import Transaction from '../../models/Transaction.js';
import Withdrawal from '../../models/Withdrawal.js';
import CoinPlan from '../../models/CoinPlan.js';
import { BadRequestError, ValidationError } from '../../utils/errors.js';

class DataValidation {
  /**
   * Validate user can send message (has enough coins)
   */
  async validateMessageSend(userId, coinsRequired = 50) {
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    if (user.isBlocked) {
      throw new BadRequestError('User account is blocked');
    }

    if (user.role === 'male' && user.coinBalance < coinsRequired) {
      throw new BadRequestError(`Insufficient coins. Required: ${coinsRequired}, Available: ${user.coinBalance}`);
    }

    return true;
  }

  /**
   * Validate user can initiate video call
   */
  async validateVideoCall(userId, coinsRequired = 500) {
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    if (user.role !== 'male') {
      throw new BadRequestError('Only male users can initiate video calls');
    }

    if (user.coinBalance < coinsRequired) {
      throw new BadRequestError(`Insufficient coins. Required: ${coinsRequired}, Available: ${user.coinBalance}`);
    }

    return true;
  }



  /**
   * Validate withdrawal request
   */
  async validateWithdrawal(userId, coinsRequested) {
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    if (user.role !== 'female') {
      throw new BadRequestError('Only female users can request withdrawals');
    }

    if (user.coinBalance < coinsRequested) {
      throw new BadRequestError('Insufficient balance for withdrawal');
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await Withdrawal.countDocuments({
      userId,
      status: 'pending',
    });

    if (pendingWithdrawals > 0) {
      throw new BadRequestError('You already have a pending withdrawal request');
    }

    return true;
  }

  /**
   * Validate chat participants
   */
  async validateChatParticipants(userId1, userId2) {
    if (userId1.toString() === userId2.toString()) {
      throw new BadRequestError('Cannot create chat with yourself');
    }

    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) {
      throw new BadRequestError('One or both users not found');
    }

    if (user1.isBlocked || user2.isBlocked) {
      throw new BadRequestError('Cannot create chat with blocked user');
    }

    // Ensure one is male and one is female
    if (user1.role === user2.role) {
      throw new BadRequestError('Chat can only be between male and female users');
    }

    return { user1, user2 };
  }

  /**
   * Validate coin plan purchase
   */
  async validateCoinPlan(planId) {
    const plan = await CoinPlan.findById(planId);
    if (!plan) {
      throw new BadRequestError('Coin plan not found');
    }

    if (!plan.isActive) {
      throw new BadRequestError('Coin plan is not available');
    }

    return plan;
  }

  /**
   * Validate female user can be approved
   */
  async validateFemaleApproval(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    if (user.role !== 'female') {
      throw new BadRequestError('Only female users can be approved');
    }

    if (user.approvalStatus === 'approved') {
      throw new BadRequestError('User is already approved');
    }

    // Check if verification document exists
    if (!user.verificationDocuments?.aadhaarCard?.url) {
      throw new BadRequestError('Verification document is required');
    }

    return user;
  }
}

export default new DataValidation();

