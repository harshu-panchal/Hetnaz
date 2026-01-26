/**
 * Withdrawal Model - Female User Withdrawal Requests
 * @owner: Sujal (Wallet Domain)
 * @purpose: Track withdrawal requests from female users
 */

import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coinsRequested: {
      type: Number,
      required: [true, 'Coins requested is required'],
      min: [0, 'Coins requested cannot be negative'],
    },
    payoutMethod: {
      type: String,
      enum: ['UPI', 'bank'],
      required: true,
    },
    payoutDetails: {
      // UPI details
      upiId: String,
      // Bank details
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    // Payout calculation
    payoutPercentage: {
      type: Number,
      required: true,
      min: [0, 'Payout percentage cannot be negative'],
      max: [100, 'Payout percentage cannot exceed 100'],
    },
    payoutAmountINR: {
      type: Number,
      required: true,
      min: [0, 'Payout amount cannot be negative'],
    },
    processingFee: {
      type: Number,
      default: 0,
      min: [0, 'Processing fee cannot be negative'],
    },
    netPayoutAmount: {
      type: Number,
      required: true,
      min: [0, 'Net payout amount cannot be negative'],
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'],
      default: 'pending',
    },
    // Admin review
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    rejectionReason: String,
    // Payment processing
    paidAt: Date,
    paymentTransactionId: String,
    // Transaction reference
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });
withdrawalSchema.index({ payoutMethod: 1 });

// Instance method: Calculate payout
withdrawalSchema.methods.calculatePayout = function (payoutPercentage, processingFee = 0) {
  this.payoutPercentage = payoutPercentage;
  this.payoutAmountINR = (this.coinsRequested * payoutPercentage) / 100;
  this.processingFee = processingFee;
  this.netPayoutAmount = this.payoutAmountINR - this.processingFee;
};

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;

