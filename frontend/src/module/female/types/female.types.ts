export interface User {
  id: string;
  name: string;
  avatar: string;
  isPremium: boolean;
  isOnline: boolean;
}

export interface Earnings {
  totalEarnings: number;
  availableBalance: number;
  pendingWithdrawals: number;
}

export interface Stats {
  messagesReceived: number;
  activeConversations: number;
  profileViews: number;
}

export interface Chat {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  hasUnread: boolean;
  unreadCount?: number;
}

export interface FemaleDashboardData {
  user: User;
  earnings: Earnings;
  stats: Stats;
  activeChats: Chat[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'photo';
  isSent: boolean; // true if sent by current user, false if received
  readStatus?: 'sent' | 'delivered' | 'read';
}

export interface EarningsBreakdown {
  date: string;
  amount: number;
  source: 'message' | 'video_call' | 'other';
  fromUserId?: string;
  fromUserName?: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  paymentMethod: 'bank' | 'upi';
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  upiDetails?: {
    upiId: string;
  };
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

export interface AutoMessageTemplate {
  id: string;
  name: string;
  content: string;
  triggerType: 'time_based' | 'keyword_based' | 'manual';
  triggerCondition?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'earnings' | 'message' | 'withdrawal' | 'system' | 'video_call';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
  relatedUserId?: string;
  relatedChatId?: string;
  actionUrl?: string;
}


