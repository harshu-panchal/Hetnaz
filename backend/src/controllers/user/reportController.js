/**
 * Report Controller - Handling User Reports
 * @owner: Wallet Domain (Safety)
 * @purpose: Allow users to report others and admins to manage reports
 */

import Report from '../../models/Report.js';
import User from '../../models/User.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';

/**
 * Report a user
 */
export const createReport = async (req, res, next) => {
    try {
        const reporterId = req.user.id;
        const { reportedId, reason, description, chatId } = req.body;

        if (reporterId === reportedId) {
            throw new BadRequestError('You cannot report yourself');
        }

        // Check if reported user exists
        const reportedUser = await User.findById(reportedId);
        if (!reportedUser) {
            throw new NotFoundError('User being reported not found');
        }

        // Create report
        const report = await Report.create({
            reporterId,
            reportedId,
            reason,
            description,
            chatId,
            status: 'pending',
            autoBlocked: true // Reporter auto-blocks reported user
        });

        // AUTO-BLOCK: Reporter blocks reported user from communication
        // Add reportedId to reporter's blockedUsers array
        await User.findByIdAndUpdate(
            reporterId,
            { $addToSet: { blockedUsers: reportedId } }
        );

        // Add reporterId to reported user's blockedBy array
        await User.findByIdAndUpdate(
            reportedId,
            { $addToSet: { blockedBy: reporterId } }
        );

        res.status(201).json({
            status: 'success',
            message: 'Report submitted successfully. You can no longer communicate with this user.',
            data: { report }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'fail',
                message: 'You have already reported this user'
            });
        }
        next(error);
    }
};

/**
 * Get all reports (Admin only)
 */
export const getAllReports = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status && status !== 'all') query.status = status;

        const skip = (page - 1) * limit;

        const reports = await Report.find(query)
            .populate('reporterId', 'profile.name phoneNumber role')
            .populate('reportedId', 'profile.name phoneNumber role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Report.countDocuments(query);

        res.status(200).json({
            status: 'success',
            data: {
                reports,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update report status / Take action (Admin only)
 */
export const updateReportStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminAction } = req.body;
        const adminId = req.user.id;

        const report = await Report.findById(id);
        if (!report) {
            throw new NotFoundError('Report not found');
        }

        report.status = status || report.status;
        report.adminAction = adminAction || report.adminAction;
        report.reviewedBy = adminId;
        report.reviewedAt = new Date();

        await report.save();

        // If action is to block user, handle it
        if (adminAction === 'permanently_blocked') {
            await User.findByIdAndUpdate(report.reportedId, { isBlocked: true });
        }

        res.status(200).json({
            status: 'success',
            message: 'Report updated successfully',
            data: { report }
        });
    } catch (error) {
        next(error);
    }
};
