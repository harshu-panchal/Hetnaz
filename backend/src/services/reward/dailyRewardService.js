/**
 * Daily Reward Service
 * @purpose: Handle daily login rewards for male users
 */

import User from '../../models/User.js';
import { BadRequestError } from '../../utils/errors.js';

const DAILY_REWARD_AMOUNT = 20;

/**
 * Check if user is eligible for daily reward and claim it
 * @param {string} userId - User ID
 * @returns {Promise<{claimed: boolean, amount: number, newBalance: number}>}
 */
export const claimDailyReward = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new BadRequestError('User not found');
    }

    // Only male users get daily rewards
    if (user.role !== 'male') {
        return {
            claimed: false,
            amount: 0,
            newBalance: user.coinBalance,
            reason: 'Daily rewards are only for male users'
        };
    }

    // Check if user already claimed today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const lastRewardDate = user.lastDailyRewardDate ? new Date(user.lastDailyRewardDate) : null;

    if (lastRewardDate) {
        lastRewardDate.setHours(0, 0, 0, 0); // Start of that day

        // If already claimed today, return without giving reward
        if (lastRewardDate.getTime() === today.getTime()) {
            return {
                claimed: false,
                amount: 0,
                newBalance: user.coinBalance,
                reason: 'Already claimed today',
                lastClaimDate: user.lastDailyRewardDate
            };
        }
    }

    // Award the daily reward
    user.coinBalance += DAILY_REWARD_AMOUNT;
    user.lastDailyRewardDate = new Date();
    await user.save();

    console.log(`[DAILY-REWARD] User ${userId} claimed ${DAILY_REWARD_AMOUNT} coins. New balance: ${user.coinBalance}`);

    return {
        claimed: true,
        amount: DAILY_REWARD_AMOUNT,
        newBalance: user.coinBalance,
        isFirstClaim: !lastRewardDate
    };
};

/**
 * Check eligibility without claiming
 * @param {string} userId - User ID
 * @returns {Promise<{eligible: boolean, reason?: string}>}
 */
export const checkDailyRewardEligibility = async (userId) => {
    const user = await User.findById(userId);

    if (!user || user.role !== 'male') {
        return { eligible: false, reason: 'Not eligible' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastRewardDate = user.lastDailyRewardDate ? new Date(user.lastDailyRewardDate) : null;

    if (!lastRewardDate) {
        return { eligible: true, reason: 'First time claim' };
    }

    lastRewardDate.setHours(0, 0, 0, 0);

    if (lastRewardDate.getTime() === today.getTime()) {
        return { eligible: false, reason: 'Already claimed today' };
    }

    return { eligible: true, reason: 'New day' };
};
