/**
 * Admin Report Controller
 * @owner: Admin (Report Management)
 * @purpose: Handle admin operations for user reports
 */

import Report from '../../models/Report.js';
import User from '../../models/User.js';
import AuditLog from '../../models/AuditLog.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

/**
 * Get all reports with filters
 * @route GET /api/admin/reports
 * @access Admin
 */
export const getReports = async (req, res, next) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [reports, total] = await Promise.all([
            Report.find(query)
                .populate('reporterId', 'profile phoneNumber role')
                .populate('reportedId', 'profile phoneNumber role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Report.countDocuments(query)
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                reports,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get report statistics
 * @route GET /api/admin/reports/stats
 * @access Admin
 */
export const getReportStats = async (req, res, next) => {
    try {
        const [
            totalReports,
            pendingReports,
            reviewedReports,
            actionTakenReports,
            dismissedReports,
            recentReports
        ] = await Promise.all([
            Report.countDocuments(),
            Report.countDocuments({ status: 'pending' }),
            Report.countDocuments({ status: 'reviewed' }),
            Report.countDocuments({ status: 'action_taken' }),
            Report.countDocuments({ status: 'dismissed' }),
            Report.find({ status: 'pending' })
                .populate('reporterId', 'profile')
                .populate('reportedId', 'profile')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Get most reported users
        const reportedUsers = await Report.aggregate([
            { $group: { _id: '$reportedId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    total: totalReports,
                    pending: pendingReports,
                    reviewed: reviewedReports,
                    actionTaken: actionTakenReports,
                    dismissed: dismissedReports
                },
                recentReports,
                mostReportedUsers: reportedUsers
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Take action on a report
 * @route POST /api/admin/reports/:reportId/action
 * @access Admin
 */
export const takeActionOnReport = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        const { status, adminAction, notes } = req.body;
        const adminId = req.user.id;

        if (!status || !adminAction) {
            throw new BadRequestError('Status and action are required');
        }

        const report = await Report.findById(reportId)
            .populate('reporterId', 'profile')
            .populate('reportedId', 'profile');

        if (!report) {
            throw new NotFoundError('Report not found');
        }

        // Update report
        report.status = status;
        report.adminAction = adminAction;
        report.reviewedBy = adminId;
        report.reviewedAt = new Date();
        if (notes) report.adminNotes = notes;

        await report.save();

        // If action is to block user, actually block them
        if (adminAction === 'permanently_blocked' || adminAction === 'temporarily_blocked') {
            const reportedUser = await User.findById(report.reportedId._id);
            if (reportedUser) {
                reportedUser.isBlocked = true;
                reportedUser.blockReason = `Reported for: ${report.reason}. ${notes || ''}`;
                reportedUser.blockedAt = new Date();
                reportedUser.blockedByAdmin = adminId;
                await reportedUser.save();
            }
        }

        // Create audit log
        const admin = await User.findById(adminId);
        await AuditLog.create({
            adminId,
            adminName: admin?.profile?.name || 'Admin',
            action: 'report_reviewed',
            actionType: 'content_moderation',
            targetUserId: report.reportedId._id,
            targetUserName: report.reportedId.profile?.name || 'Unknown',
            details: {
                reportId: report._id,
                reportReason: report.reason,
                adminAction,
                status,
                notes
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Action taken successfully',
            data: { report }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single report details
 * @route GET /api/admin/reports/:reportId
 * @access Admin
 */
export const getReportById = async (req, res, next) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId)
            .populate('reporterId', 'profile phoneNumber role email createdAt')
            .populate('reportedId', 'profile phoneNumber role email createdAt isBlocked')
            .populate('reviewedBy', 'profile');

        if (!report) {
            throw new NotFoundError('Report not found');
        }

        res.status(200).json({
            status: 'success',
            data: { report }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getReports,
    getReportStats,
    takeActionOnReport,
    getReportById
};
