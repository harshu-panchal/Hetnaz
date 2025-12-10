export interface User {
  id: string;
  name: string;
  avatar: string;
  isPremium: boolean;
  isOnline: boolean;
}

export interface Wallet {
  balance: number;
}

export interface Stats {
  matches: number;
  sent: number;
  views: number;
}

export interface NearbyUser {
  id: string;
  avatar: string;
  name: string;
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
  isVIP?: boolean;
  messageType?: 'text' | 'image' | 'photo';
  readStatus?: 'sent' | 'delivered' | 'read';
}

export interface MaleDashboardData {
  user: User;
  wallet: Wallet;
  stats: Stats;
  nearbyUsers: NearbyUser[];
  activeChats: Chat[];
}

export interface NearbyFemale {
  id: string;
  name: string;
  age: number;
  avatar: string;
  distance: string;
  isOnline: boolean;
  occupation?: string;
  bio?: string;
  chatCost: number;
}

export type FilterType = 'all' | 'online' | 'new' | 'popular';

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
  cost?: number; // Cost in coins for male users
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'spent' | 'bonus' | 'gift' | 'other';
  title: string;
  timestamp: string;
  amount: number;
  isPositive: boolean;
}

export interface CoinPlan {
  id: string;
  tier: 'basic' | 'silver' | 'gold' | 'platinum';
  price: number;
  coins: number;
  originalPrice?: number;
  bonus?: string;
  badge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'system' | 'payment' | 'gift';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
  relatedUserId?: string;
  relatedChatId?: string;
  actionUrl?: string;
}

