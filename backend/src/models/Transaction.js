/**
 * Transaction Model - All Financial Transactions
 * @owner: Sujal (Wallet Domain)
 * @purpose: Track all coin transactions (purchases, spending, earnings, withdrawals)
 */

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'purchase', // Coin purchase
        'message_spent', // Male user spent coins on message
        'message_earned', // Female user earned coins from message
        'image_spent', // Male user spent coins on image message
        'image_earned', // Female user earned coins from image message
        'video_call_spent', // Male user spent coins on video call
        'video_call_earned', // Female user earned coins from video call
        'gift_sent', // Male user sent gift
        'gift_received', // Female user received gift
        'withdrawal', // Withdrawal request
        'adjustment', // Admin adjustment
        'bonus', // Bonus coins
        'referral_bonus', // Referral reward
      ],
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amountCoins: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    amountINR: {
      type: Number,
      default: 0,
    },
    // Related entities
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    relatedMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    relatedWithdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Withdrawal',
    },
    // Payment details (for purchases)
    payment: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paymentMethod: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
    },
    // Coin plan reference (for purchases)
    coinPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoinPlan',
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
      index: true,
    },
    // Balance snapshot (for audit trail)
    balanceBefore: Number,
    balanceAfter: Number,
    // Description
    description: String,
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
transactionSchema.index({ userId: 1, direction: 1, type: 1, status: 1 });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ 'payment.razorpayOrderId': 1 });
transactionSchema.index({ 'payment.razorpayPaymentId': 1 });

// Instance method: Get transaction summary
transactionSchema.methods.getSummary = function () {
  return {
    type: this.type,
    direction: this.direction,
    amount: this.amountCoins,
    status: this.status,
    createdAt: this.createdAt,
  };
};

// Before save: Validate transaction data
transactionSchema.pre('save', async function (next) {
  // Validate direction matches type
  const creditTypes = ['purchase', 'message_earned', 'image_earned', 'video_call_earned', 'gift_received', 'bonus', 'referral_bonus'];
  const debitTypes = ['message_spent', 'image_spent', 'video_call_spent', 'gift_sent', 'withdrawal', 'adjustment'];

  if (this.direction === 'credit' && !creditTypes.includes(this.type)) {
    return next(new Error(`Invalid transaction type ${this.type} for credit direction`));
  }

  if (this.direction === 'debit' && !debitTypes.includes(this.type)) {
    return next(new Error(`Invalid transaction type ${this.type} for debit direction`));
  }

  // Validate balance consistency
  if (this.balanceBefore !== undefined && this.balanceAfter !== undefined) {
    const expectedAfter = this.direction === 'credit'
      ? this.balanceBefore + this.amountCoins
      : this.balanceBefore - this.amountCoins;

    if (this.balanceAfter !== expectedAfter) {
      return next(new Error('Balance calculation mismatch'));
    }
  }

  next();
});

// After save: Log transaction
transactionSchema.post('save', async function (doc) {
  if (doc.status === 'completed') {
    // Lazy import to avoid circular dependency
    import('../utils/logger.js').then(({ default: logger }) => {
      logger.debug(`Transaction ${doc._id} saved: ${doc.type} ${doc.amountCoins} coins`);
    });
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

