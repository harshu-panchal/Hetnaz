/**
 * Daily Reward Routes
 */

import express from 'express';
import * as dailyRewardController from '../../controllers/reward/dailyRewardController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/rewards/daily/claim - Claim daily reward
router.post('/daily/claim', dailyRewardController.claimDailyReward);

// GET /api/rewards/daily/check - Check eligibility
router.get('/daily/check', dailyRewardController.checkDailyReward);

export default router;
