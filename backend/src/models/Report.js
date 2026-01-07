/**
 * Report Model - User Reports for Safety & Compliance
 * @owner: Wallet Domain (Safety)
 * @purpose: Track reports filed by users against each other
 */

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        reportedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            index: true,
        },
        reason: {
            type: String,
            required: [true, 'Reason for reporting is required'],
            enum: [
                'inappropriate_behavior',
                'spam',
                'harassment',
                'fake_profile',
                'scamming',
                'other'
            ],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'action_taken', 'dismissed'],
            default: 'pending',
            index: true,
        },
        adminAction: {
            type: String,
            enum: ['none', 'warned', 'temporarily_blocked', 'permanently_blocked'],
            default: 'none',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reports for same user-pair in pending status
reportSchema.index({ reporterId: 1, reportedId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

const Report = mongoose.model('Report', reportSchema);

export default Report;
