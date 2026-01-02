/**
 * Chat Types
 * @purpose: TypeScript interfaces for chat-related data
 */

export interface ChatUser {
    _id: string;
    name: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: Date | string;
    isVerified?: boolean;
    latitude?: number;
    longitude?: number;
    profile?: {
        location?: {
            city?: string;
            country?: string;
            coordinates?: [number, number]; // [lng, lat]
        };
    };
}

export interface Message {
    _id: string;
    chatId: string;
    senderId: {
        _id: string;
        profile?: {
            name?: string;
            photos?: Array<{ url: string }>;
        };
    };
    receiverId: {
        _id: string;
        profile?: {
            name?: string;
            photos?: Array<{ url: string }>;
        };
    };
    content: string;
    messageType: 'text' | 'image' | 'gift' | 'video_call';
    gifts?: Array<{
        giftId: string;
        giftName: string;
        giftCost: number;
        giftImage: string;
    }>;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    attachments?: Array<{
        type: 'image' | 'video' | 'audio';
        url: string;
        thumbnail?: string;
        size?: number;
        mimeType?: string;
    }>;
    createdAt: string | Date;
    deliveredAt?: string | Date;
    readAt?: string | Date;
}

export interface IntimacyInfo {
    level: number;
    badge: string;
    totalMessages: number;
    messagesForCurrentLevel: number;
    messagesForNextLevel: number | null;
    messagesToNextLevel: number;
    progress: number;
}

export interface Chat {
    _id: string;
    otherUser: ChatUser;
    lastMessage?: Message;
    lastMessageAt: string | Date;
    unreadCount: number;
    createdAt: string | Date;
    intimacy: IntimacyInfo;
}

export interface Gift {
    _id: string;
    name: string;
    category: 'romantic' | 'funny' | 'celebration' | 'appreciation' | 'special';
    imageUrl: string;
    cost: number;
    description?: string;
    isActive: boolean;
    displayOrder: number;
}
