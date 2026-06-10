import User from '../../models/User.js';
import AppSettings from '../../models/AppSettings.js';
import { calculateUserLevel } from '../../utils/levelHelper.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const settings = await AppSettings.getSettings();
    const maleLevels = settings.maleLevels || [];

    // Find top 50 male users by totalCoinsSpent
    const users = await User.find({
      role: 'male',
      isActive: true,
      isBlocked: false,
      isDeleted: false
    })
      .select('profile.name profile.photos totalCoinsSpent lastSeen')
      .sort({ totalCoinsSpent: -1 })
      .limit(50)
      .lean();

    const rankings = users.map((u, index) => {
      const levelInfo = calculateUserLevel(u.totalCoinsSpent || 0, maleLevels);
      return {
        rank: index + 1,
        userId: u._id,
        name: u.profile?.name || 'Anonymous User',
        avatar: u.profile?.photos?.[0]?.url || null,
        level: levelInfo.level,
        badgeName: levelInfo.badgeName,
        totalCoinsSpent: u.totalCoinsSpent || 0,
      };
    });

    // Get current user's rank relative to all active male users
    const currentUser = req.user;
    let myRank = null;

    if (currentUser && currentUser.role === 'male') {
      const mySpent = currentUser.totalCoinsSpent || 0;
      const higherSpentCount = await User.countDocuments({
        role: 'male',
        isActive: true,
        isBlocked: false,
        isDeleted: false,
        totalCoinsSpent: { $gt: mySpent }
      });
      myRank = higherSpentCount + 1;
    }

    res.status(200).json({
      status: 'success',
      data: {
        rankings,
        myRank,
      }
    });
  } catch (error) {
    next(error);
  }
};
