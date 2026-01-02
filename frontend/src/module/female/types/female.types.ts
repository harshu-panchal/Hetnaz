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
  distance?: string;
}

export interface FemaleDashboardData {
  user: User;
  earnings: Earnings;
  stats: Stats;
  activeChats: Chat[];
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  cost: number; // Original cost in coins
  tradeValue: number; // Value when traded for money (per unit)
  description?: string;
  category?: 'romantic' | 'fun' | 'luxury' | 'special';
  receivedAt: Date; // When the gift was received
  senderId?: string; // Who sent the gift
  senderName?: string;
  quantity?: number; // Number of this gift (default: 1)
  imageUrl?: string;
}

export interface Attachment {
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  size?: number;
  mimeType?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'photo' | 'gift';
  isSent: boolean; // true if sent by current user, false if received
  readStatus?: 'sent' | 'delivered' | 'read';
  gifts?: Gift[]; // For gift messages
  giftNote?: string; // Optional note with gifts
  attachments?: Attachment[];
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
  isEnabled: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    sentCount: number;
    lastSentAt?: string;
  };
}

export interface Notification {
  id: string;
  type: 'earnings' | 'message' | 'withdrawal' | 'system' | 'video_call' | 'gift';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
  relatedUserId?: string;
  relatedChatId?: string;
  actionUrl?: string;
}



