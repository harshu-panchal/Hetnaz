/**
 * Referral Model - Tracks Refer & Earn relationships
 * @owner: Sujal (Wallet Domain)
 * @purpose: Track who referred whom, and whether the reward has been paid out
 *           (reward is paid only after the referred user's first coin recharge)
 */

import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
    {
        // The user who shared their referral code
        referrerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // The user who signed up using that code
        refereeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        referralCode: {
            type: String,
            uppercase: true,
        },
        status: {
            type: String,
            enum: ['pending', 'rewarded'],
            default: 'pending',
            index: true,
        },
        // Snapshot of the coin reward paid to the referrer (0 until rewarded)
        rewardCoins: {
            type: Number,
            default: 0,
        },
        rewardedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

referralSchema.index({ referrerId: 1, status: 1, createdAt: -1 });

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
