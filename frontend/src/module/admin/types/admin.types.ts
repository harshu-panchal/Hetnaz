// Admin Dashboard Data
export interface AdminDashboardData {
  stats: {
    totalUsers: { male: number; female: number; total: number };
    activeUsers: { last24h: number; last7d: number; last30d: number };
    revenue: { deposits: number; payouts: number; profit: number };
    pendingWithdrawals: number;
    pendingFemaleApprovals: number;
    totalTransactions: number;
  };
  charts: {
    userGrowth: Array<{ date: string; count: number }>;
    revenueTrends: Array<{ date: string; deposits: number; payouts: number }>;
    activityMetrics: Array<{ type: string; count: number }>;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'user_registered' | 'female_approved' | 'withdrawal_approved' | 'transaction' | 'user_blocked';
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

// User Management
export interface AdminUser {
  id: string;
  phoneNumber: string;
  name: string;
  role: 'male' | 'female' | 'admin';
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  age?: number;
  city?: string;
  bio?: string;
  photos?: (string | { url: string })[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
}

// Female Approval
export interface FemaleApproval {
  userId: string;
  user: AdminUser;
  profile: UserProfile;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'resubmit_requested';
  verificationDocuments?: {
    aadhaarCard: {
      url: string;
      verified: boolean;
    };
  };
  submittedAt: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Coin Economy
export interface CoinPlan {
  id: string;
  name: string;
  tier: 'basic' | 'silver' | 'gold' | 'platinum';
  priceInINR: number;
  baseCoins: number;
  bonusCoins: number;
  totalCoins: number;
  isActive: boolean;
  displayOrder: number;
  badge?: 'POPULAR' | 'BEST VALUE';
}

export interface PayoutSlab {
  id: string;
  minCoins: number;
  maxCoins: number | null;
  payoutPercentage: number;
  displayOrder: number;
}

export interface MessageCosts {
  basic: number;
  silver: number;
  gold: number;
  platinum: number;
  videoCall: number;
}

// Withdrawal Management
export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  coinsRequested: number;
  payoutMethod: 'UPI' | 'bank';
  payoutDetails: {
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  payoutAmountINR: number;
  payoutPercentage: number;
  createdAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  paidAt?: string;
}

// Transaction
export interface AdminTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'purchase' | 'message_spent' | 'message_earned' | 'image_spent' | 'image_earned' | 'withdrawal' | 'adjustment' | 'gift_sent' | 'gift_received';
  amountCoins: number;
  amountINR?: number;
  direction: 'credit' | 'debit';
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  relatedEntityId?: string; // e.g., chatId, paymentId, withdrawalId
}

// Settings
export interface AdminSettings {
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    termsOfServiceUrl: string;
    privacyPolicyUrl: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  withdrawal: {
    minAmount: number;
    maxAmount: number;
    processingFee: number;
    dailyLimit: number;
    weeklyLimit: number;
  };
  messageCosts: {
    // Tier-based message costs
    basic: number;
    silver: number;
    gold: number;
    platinum: number;
    // Special message types
    hiMessage: number;
    imageMessage: number;
    // Video call cost
    videoCall: number;
  };
  giftCosts: {
    defaultCost: number;
  };
}

// Gift Management
export interface AdminGift {
  _id: string;
  name: string;
  category: 'romantic' | 'funny' | 'celebration' | 'appreciation' | 'special';
  imageUrl: string;
  cost: number;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

// Audit Log
export interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  adminName: string;
  targetUserId?: string;
  targetUserName?: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress: string;
}

