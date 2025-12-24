export interface User {
  id: string;
  name: string;
  avatar: string;
  isPremium: boolean;
  isOnline: boolean;
  badges?: Badge[];
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
  messageType?: 'text' | 'image' | 'photo' | 'gift';
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

export type FilterType = 'all' | 'nearby' | 'new' | 'popular';

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
  cost?: number; // Cost in coins for male users
  gifts?: Gift[]; // Gifts sent with the message
  giftNote?: string; // Optional note with gifts
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

export interface Gift {
  id: string;
  name: string;
  icon: string;
  imageUrl?: string;
  cost: number;
  description?: string;
  category?: 'romantic' | 'fun' | 'luxury' | 'special';
  isAvailable?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'vip' | 'achievement' | 'special' | 'limited';
  unlockedAt?: string;
  isUnlocked: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GiftTransaction {
  id: string;
  giftId: string;
  giftName: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  sentAt: string;
  cost: number;
  message?: string;
}

