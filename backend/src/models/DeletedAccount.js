/**
 * DeletedAccount Model
 * @purpose: Track deleted accounts for audit and prevent data restoration on re-registration
 */

import mongoose from 'mongoose';

const deletedAccountSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        role: {
            type: String,
            enum: ['male', 'female', 'admin'],
        },
        // Snapshot of user data at deletion time
        deletionSnapshot: {
            userId: mongoose.Schema.Types.ObjectId,
            coinBalance: Number,
            totalEarnings: Number,
            totalSpent: Number,
            totalChats: Number,
            totalMatches: Number,
            registrationDate: Date,
            approvalStatus: String,
        },
        deletedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        deletedBy: {
            type: String,
            enum: ['self', 'admin'],
            default: 'self',
        },
        deletionReason: {
            type: String,
        },
        // Admin who deleted (if admin-initiated)
        deletedByAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Index for quick lookups
deletedAccountSchema.index({ phoneNumber: 1, deletedAt: -1 });

const DeletedAccount = mongoose.model('DeletedAccount', deletedAccountSchema);

export default DeletedAccount;
