/**
 * Daily Reward Controller
 * @purpose: Handle HTTP requests for daily reward system
 */

import * as dailyRewardService from '../../services/reward/dailyRewardService.js';

/**
 * Claim daily login reward
 * @route POST /api/rewards/daily/claim
 */
export const claimDailyReward = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await dailyRewardService.claimDailyReward(userId);

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check daily reward eligibility
 * @route GET /api/rewards/daily/check
 */
export const checkDailyReward = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await dailyRewardService.checkDailyRewardEligibility(userId);

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};
