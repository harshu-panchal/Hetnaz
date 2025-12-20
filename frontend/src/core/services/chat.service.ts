/**
 * Chat Service - Frontend API Client for Chat Operations
 * @purpose: Handle API calls for chats, messages, and real-time messaging
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('matchmint_auth_token');
    return {
        Authorization: `Bearer ${token}`,
    };
};

// ========================
// CHAT LIST & MANAGEMENT
// ========================

/**
 * Get user's chat list
 */
export const getMyChatList = async () => {
    const response = await axios.get(`${API_URL}/chat/chats`, {
        headers: getAuthHeaders(),
    });
    return response.data.data.chats;
};

/**
 * Get or create chat with a user
 */
export const getOrCreateChat = async (otherUserId: string) => {
    const response = await axios.post(
        `${API_URL}/chat/chats`,
        { otherUserId },
        {
            headers: getAuthHeaders(),
        }
    );
    return response.data.data.chat;
};

/**
 * Get a specific chat by ID
 */
export const getChatById = async (chatId: string) => {
    const response = await axios.get(`${API_URL}/chat/chats/${chatId}`, {
        headers: getAuthHeaders(),
    });
    return response.data.data.chat;
};

/**
 * Get messages for a chat
 */
export const getChatMessages = async (chatId: string, params?: { limit?: number; before?: string }) => {
    const response = await axios.get(`${API_URL}/chat/chats/${chatId}/messages`, {
        headers: getAuthHeaders(),
        params,
    });
    return response.data.data;
};

/**
 * Mark chat as read
 */
export const markChatAsRead = async (chatId: string) => {
    const response = await axios.patch(
        `${API_URL}/chat/chats/${chatId}/read`,
        {},
        {
            headers: getAuthHeaders(),
        }
    );
    return response.data;
};

// ========================
// MESSAGING
// ========================

/**
 * Send text message
 */
export const sendMessage = async (chatId: string, content: string) => {
    const response = await axios.post(
        `${API_URL}/chat/messages`,
        { chatId, content },
        {
            headers: getAuthHeaders(),
        }
    );
    return response.data.data;
};

/**
 * Send "Hi" message
 */
export const sendHiMessage = async (receiverId: string) => {
    const response = await axios.post(
        `${API_URL}/chat/messages/hi`,
        { receiverId },
        {
            headers: getAuthHeaders(),
        }
    );
    return response.data.data;
};

/**
 * Send gift
 */
export const sendGift = async (chatId: string, giftId: string) => {
    const response = await axios.post(
        `${API_URL}/chat/messages/gift`,
        { chatId, giftId },
        {
            headers: getAuthHeaders(),
        }
    );
    return response.data.data;
};

// Export as default object
export default {
    getMyChatList,
    getOrCreateChat,
    getChatById,
    getChatMessages,
    markChatAsRead,
    sendMessage,
    sendHiMessage,
    sendGift,
};
