/**
 * Admin Service - Dashboard Stats and Management
 * @owner: Admin Operations
 */

import User from '../../models/User.js';
import Transaction from '../../models/Transaction.js';
import Withdrawal from '../../models/Withdrawal.js';
import AuditLog from '../../models/AuditLog.js';
import AppSettings from '../../models/AppSettings.js';
import Report from '../../models/Report.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';

/**
 * Get dashboard statistics for admin
 */
export const getDashboardStats = async () => {
    // Get total users count by role
    const userCounts = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const stats = {
        totalUsers: {
            male: userCounts.find(u => u._id === 'male')?.count || 0,
            female: userCounts.find(u => u._id === 'female')?.count || 0,
            total: 0
        },
        activeUsers: {
            last24h: 0,
            last7d: 0,
            last30d: 0
        },
        revenue: {
            deposits: 0,
            payouts: 0,
            profit: 0
        },
        pendingWithdrawals: 0,
        pendingFemaleApprovals: 0,
        pendingReports: 0,
        totalTransactions: 0
    };

    stats.totalUsers.total = stats.totalUsers.male + stats.totalUsers.female;

    // Charts data
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. User Growth Chart
    const userGrowth = await User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", count: 1, _id: 0 } }
    ]);

    // 2. Revenue Trends Chart
    const revenueTrends = await Transaction.aggregate([
        {
            $match: {
                createdAt: { $gte: thirtyDaysAgo },
                status: 'completed',
                type: { $in: ['coin_purchase', 'withdrawal'] }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                deposits: {
                    $sum: { $cond: [{ $eq: ['$type', 'coin_purchase'] }, '$amount', 0] }
                },
                payouts: {
                    $sum: { $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0] }
                }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", deposits: 1, payouts: 1, _id: 0 } }
    ]);

    // 3. Activity Metrics
    const activityMetrics = [
        { type: 'Text Messages', count: await Transaction.countDocuments({ type: 'message_spent', status: 'completed' }) },
        { type: 'Image Messages', count: await Transaction.countDocuments({ type: 'image_spent', status: 'completed' }) },
        { type: 'Video Calls', count: await Transaction.countDocuments({ type: 'video_call_spent', status: 'completed' }) },
        { type: 'Gifts', count: await Transaction.countDocuments({ type: 'gift_sent', status: 'completed' }) },
        { type: 'Withdrawals', count: await Withdrawal.countDocuments({ status: 'completed' }) }
    ];

    // 4. Recent Activity
    const recentActivityRaw = await AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    const recentActivity = recentActivityRaw.map(log => ({
        id: log._id,
        type: mapActionToType(log.action),
        message: log.details?.message || `${log.adminName} performed ${log.action}`,
        timestamp: log.createdAt,
        userId: log.targetUserId,
        userName: log.targetUserName
    }));

    // Fill in stats as before

    // Active users
    const day24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const days7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    stats.activeUsers.last24h = await User.countDocuments({ lastSeen: { $gte: day24Ago } });
    stats.activeUsers.last7d = await User.countDocuments({ lastSeen: { $gte: days7Ago } });
    stats.activeUsers.last30d = await User.countDocuments({ lastSeen: { $gte: days30Ago } });

    // Revenue stats from transactions
    const revenueData = await Transaction.aggregate([
        {
            $group: {
                _id: null,
                totalDeposits: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'coin_purchase'] }, '$amount', 0]
                    }
                }
            }
        }
    ]);

    if (revenueData.length > 0) {
        stats.revenue.deposits = revenueData[0].totalDeposits || 0;
    }

    // Payouts from withdrawals
    const payoutData = await Withdrawal.aggregate([
        {
            $match: { status: 'completed' }
        },
        {
            $group: {
                _id: null,
                totalPayouts: { $sum: '$amount' }
            }
        }
    ]);

    if (payoutData.length > 0) {
        stats.revenue.payouts = payoutData[0].totalPayouts || 0;
    }

    stats.revenue.profit = stats.revenue.deposits - stats.revenue.payouts;

    // Pending withdrawals
    stats.pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    // Pending female approvals
    stats.pendingFemaleApprovals = await User.countDocuments({ role: 'female', approvalStatus: 'pending' });

    // Pending reports
    stats.pendingReports = await Report.countDocuments({ status: 'pending' });

    // Total transactions
    stats.totalTransactions = await Transaction.countDocuments();

    return {
        stats,
        charts: {
            userGrowth,
            revenueTrends,
            activityMetrics
        },
        recentActivity
    };
};

/**
 * Map audit action to activity type
 */
const mapActionToType = (action) => {
    if (action.includes('register')) return 'user_registered';
    if (action.includes('approve')) return 'female_approved';
    if (action.includes('withdrawal')) return 'withdrawal_approved';
    if (action.includes('transaction')) return 'transaction';
    if (action.includes('block')) return 'user_blocked';
    return 'transaction';
};

/**
 * Get pending females for approval
 */
export const getPendingFemales = async (pagination, status = 'pending') => {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const query = {
        role: 'female'
    };

    if (status && status !== 'all') {
        query.approvalStatus = status;
    }

    const users = await User.find(query)
        .select('phoneNumber profile verificationDocuments approvalStatus rejectionReason createdAt lastSeen isBlocked isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await User.countDocuments(query);

    // Get counts for all statuses for the tabs
    const statusCounts = await User.aggregate([
        { $match: { role: 'female' } },
        { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }
    ]);

    const stats = {
        all: statusCounts.reduce((sum, s) => sum + s.count, 0),
        pending: statusCounts.find(s => s._id === 'pending')?.count || 0,
        approved: statusCounts.find(s => s._id === 'approved')?.count || 0,
        rejected: statusCounts.find(s => s._id === 'rejected')?.count || 0,
        resubmit_requested: statusCounts.find(s => s._id === 'resubmit_requested')?.count || 0
    };

    return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        stats
    };
};

/**
 * Approve female user
 */
export const approveFemale = async (userId, adminId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (user.role !== 'female') {
        throw new BadRequestError('User is not a female');
    }

    user.approvalStatus = 'approved';
    user.isVerified = true;
    user.rejectionReason = undefined;

    await user.save();

    return user;
};

/**
 * Reject female user
 */
export const rejectFemale = async (userId, adminId, reason) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (user.role !== 'female') {
        throw new BadRequestError('User is not a female');
    }

    user.approvalStatus = 'rejected';
    user.rejectionReason = reason;

    await user.save();

    return user;
};

/**
 * Request resubmission from female user
 */
export const requestResubmitFemale = async (userId, adminId, reason) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (user.role !== 'female') {
        throw new BadRequestError('User is not a female');
    }

    user.approvalStatus = 'resubmit_required';
    user.rejectionReason = reason;

    await user.save();

    return user;
};

/**
 * List all users for admin with filters
 */
export const listUsers = async (filters, pagination) => {
    const { page = 1, limit = 20 } = pagination;
    const { search, role, status } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (role && role !== 'all') query.role = role;
    if (status === 'blocked') query.isBlocked = true;
    if (status === 'active') query.isBlocked = false;
    if (status === 'verified') query.isVerified = true;

    if (search) {
        query.$or = [
            { phoneNumber: { $regex: search, $options: 'i' } },
            { 'profile.name': { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query)
        .select('-password -otp')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await User.countDocuments(query);

    return {
        users: users.map(u => ({
            id: u._id,
            phoneNumber: u.phoneNumber,
            name: u.profile?.name || u.fullName || 'Unknown',
            role: u.role,
            isBlocked: u.isBlocked,
            isVerified: u.isVerified,
            createdAt: u.createdAt,
            lastLoginAt: u.lastSeen,
            profile: u.profile
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

/**
 * List all transactions for admin
 */
export const listTransactions = async (filters, pagination) => {
    const { page = 1, limit = 20 } = pagination;
    const { search, type, status } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;

    if (search) {
        // We might need to find user IDs first if searching by name
        const userQuery = {
            $or: [
                { phoneNumber: { $regex: search, $options: 'i' } },
                { 'profile.name': { $regex: search, $options: 'i' } }
            ]
        };
        const userIds = await User.find(userQuery).distinct('_id');
        query.userId = { $in: userIds };
    }

    const transactions = await Transaction.find(query)
        .populate('userId', 'profile.name phoneNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Transaction.countDocuments(query);

    return {
        transactions: transactions.map(t => ({
            id: t._id,
            userId: t.userId?._id,
            userName: t.userId?.profile?.name || 'Unknown',
            type: t.type,
            amountCoins: t.amountCoins,
            amountINR: t.amount,
            direction: t.direction,
            timestamp: t.createdAt,
            status: t.status,
            relatedEntityId: t.relatedEntityId
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};



/**
 * Get platform settings
 */
export const getAppSettings = async () => {
    return await AppSettings.getSettings();
};

/**
 * Update platform settings
 */
export const updateAppSettings = async (newSettings, adminId) => {
    const settings = await AppSettings.getSettings();

    // Update fields
    if (newSettings.general) Object.assign(settings.general, newSettings.general);
    if (newSettings.withdrawal) Object.assign(settings.withdrawal, newSettings.withdrawal);
    if (newSettings.messageCosts) Object.assign(settings.messageCosts, newSettings.messageCosts);

    await settings.save();

    // Log the change
    const admin = await User.findById(adminId);
    await AuditLog.create({
        adminId,
        adminName: admin?.profile?.name || 'Admin',
        action: 'settings_updated',
        actionType: 'settings_update',
        details: { message: 'Platform settings updated' }
    });

    return settings;
};

/**
 * Toggle user block status (with reason tracking)
 */
export const toggleBlockUser = async (userId, adminId, reason = null) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    user.isBlocked = !user.isBlocked;

    if (user.isBlocked) {
        // Blocking user - track admin action
        user.blockReason = reason || 'Admin-initiated block';
        user.blockedAt = new Date();
        user.blockedByAdmin = adminId;
    } else {
        // Unblocking user - clear block metadata
        user.blockReason = undefined;
        user.blockedAt = undefined;
        user.blockedByAdmin = undefined;
    }

    await user.save();

    // Log the change
    const admin = await User.findById(adminId);
    await AuditLog.create({
        adminId,
        adminName: admin?.profile?.name || 'Admin',
        action: user.isBlocked ? 'user_blocked' : 'user_unblocked',
        actionType: 'user_management',
        targetUserId: userId,
        targetUserName: user.profile?.name || user.fullName,
        details: {
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} by admin`,
            reason: user.isBlocked ? reason : null
        }
    });

    return user;
};

/**
 * Toggle user verification status
 */
export const toggleVerifyUser = async (userId, adminId) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    user.isVerified = !user.isVerified;
    await user.save();

    // Log the change
    const admin = await User.findById(adminId);
    await AuditLog.create({
        adminId,
        adminName: admin?.profile?.name || 'Admin',
        action: user.isVerified ? 'user_verified' : 'user_unverified',
        actionType: 'user_management',
        targetUserId: userId,
        targetUserName: user.profile?.name || user.fullName,
        details: { message: `User ${user.isVerified ? 'verified' : 'unverified'} by admin` }
    });

    return user;
};

/**
 * Delete user (soft delete recommended, but here we'll follow project pattern)
 */
export const deleteUser = async (userId, adminId) => {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    // In a real app we might do soft delete, but here we delete
    await User.findByIdAndDelete(userId);

    // Log the change
    const admin = await User.findById(adminId);
    await AuditLog.create({
        adminId,
        adminName: admin?.profile?.name || 'Admin',
        action: 'user_deleted',
        actionType: 'user_management',
        targetUserId: userId,
        targetUserName: user.profile?.name || user.fullName,
        details: { message: 'User deleted by admin' }
    });

    return true;
};
