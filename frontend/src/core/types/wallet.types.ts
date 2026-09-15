/**
 * Wallet Types - TypeScript definitions for Coin Economy
 */

// ========================
// COIN PLANS
// ========================

export type CoinPlanTier = 'basic' | 'silver' | 'gold' | 'platinum';

export interface CoinPlan {
    _id: string;
    id?: string;
    name: string;
    tier: CoinPlanTier;
    priceInINR: number;
    baseCoins: number;
    bonusCoins: number;
    totalCoins: number;
    bonusPercentage: number;
    badge?: 'POPULAR' | 'BEST_VALUE' | null;
    isActive: boolean;
    displayOrder: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

// ========================
// PAYOUT SLABS
// ========================

export interface PayoutSlab {
    _id: string;
    id?: string;
    minCoins: number;
    maxCoins: number | null;
    payoutPercentage: number;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ========================
// TRANSACTIONS
// ========================

export type TransactionType =
    | 'purchase'
    | 'message_spent'
    | 'message_earned'
    | 'video_call_spent'
    | 'video_call_earned'
    | 'voice_call_spent'
    | 'voice_call_earned'
    | 'gift_sent'
    | 'gift_received'
    | 'withdrawal'
    | 'adjustment'
    | 'bonus';

export type TransactionDirection = 'credit' | 'debit';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
    _id: string;
    id?: string;
    userId: string;
    type: TransactionType;
    direction: TransactionDirection;
    amountCoins: number;
    amountINR?: number;
    relatedUserId?: string;
    relatedChatId?: string;
    relatedMessageId?: string;
    relatedWithdrawalId?: string;
    payment?: {
        razorpayOrderId?: string;
        razorpayPaymentId?: string;
        razorpaySignature?: string;
        paymentMethod?: string;
        status?: 'pending' | 'completed' | 'failed' | 'refunded';
    };
    coinPlanId?: string;
    status: TransactionStatus;
    balanceBefore?: number;
    balanceAfter?: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

// ========================
// WITHDRAWALS
// ========================

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';

export type PayoutMethod = 'UPI' | 'bank';

export interface PayoutDetails {
    upiId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
}

export interface Withdrawal {
    _id: string;
    id?: string;
    userId: string;
    coinsRequested: number;
    payoutMethod: PayoutMethod;
    payoutDetails: PayoutDetails;
    payoutPercentage: number;
    payoutAmountINR: number;
    processingFee: number;
    netPayoutAmount: number;
    status: WithdrawalStatus;
    reviewedBy?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    paidAt?: string;
    paymentTransactionId?: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

// ========================
// BALANCE
// ========================

export interface WalletBalance {
    balance: number;
    memberTier: CoinPlanTier;
}

// ========================
// PAGINATION
// ========================

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

// ========================
// EARNINGS (Female Dashboard)
// ========================

export interface EarningsBreakdown {
    date: string;
    amount: number;
    source: 'message' | 'video_call' | 'gift';
    fromUserId?: string;
    fromUserName?: string;
}

export interface EarningsSummary {
    totalEarned: number;
    availableBalance: number;
    pendingWithdrawals: number;
    todayEarnings: number;
    weekEarnings: number;
    monthEarnings: number;
}

// ========================
// GIFT CATALOG
// ========================

export type GiftCategory = 'romantic' | 'funny' | 'celebration' | 'appreciation' | 'special';

export interface Gift {
    _id: string;
    id?: string;
    name: string;
    category: GiftCategory;
    imageUrl: string;
    cost: number;
    description?: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}
