import apiClient from '../api/client';

// ========================
// CHAT LIST & MANAGEMENT
// ========================

export const getMyChatList = async (search?: string) => {
    try {
        const language = localStorage.getItem('user_language') || 'en';
        const response = await apiClient.get('/chat/chats', {
            params: { language, search }
        });
        console.log('🔍 [DEBUG] RAW My Chat List Data:', response.data);
        return response.data.data.chats;
    } catch (error) {
        console.error('❌ [DEBUG] Chat List Fetch Error:', error);
        throw error;
    }
};

export const getOrCreateChat = async (otherUserId: string) => {
    try {
        const language = localStorage.getItem('user_language') || 'en';
        const response = await apiClient.post('/chat/chats', { otherUserId }, {
            params: { language }
        });
        return response.data.data.chat;
    } catch (error: any) {
        // Handle blocking errors with user-friendly messages
        if (error.response?.status === 403 && error.response?.data?.blocked) {
            const blockData = error.response.data;
            throw new Error(blockData.message || 'You cannot communicate with this user.');
        }
        throw error;
    }
};

export const getChatById = async (chatId: string) => {
    const response = await apiClient.get(`/chat/chats/${chatId}`);
    return response.data.data.chat;
};

export const getChatMessages = async (chatId: string, params?: any) => {
    const response = await apiClient.get(`/chat/chats/${chatId}/messages`, { params });
    return response.data.data;
};

export const markChatAsRead = async (chatId: string) => {
    const response = await apiClient.patch(`/chat/chats/${chatId}/read`);
    return response.data;
};

export const sendMessage = async (
    chatId: string,
    content: string,
    messageType: 'text' | 'image' = 'text',
    imageUrl?: string
) => {
    try {
        const payload: any = { chatId, content, messageType };

        if (messageType === 'image' && imageUrl) {
            payload.attachments = [{ type: 'image', url: imageUrl }];
        }

        const response = await apiClient.post('/chat/messages', payload);
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 403 && error.response?.data?.blocked) {
            throw new Error(error.response.data.message || 'You cannot communicate with this user.');
        }
        throw error;
    }
};

export const sendHiMessage = async (receiverId: string) => {
    try {
        const response = await apiClient.post('/chat/messages/hi', { receiverId });
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 403 && error.response?.data?.blocked) {
            throw new Error(error.response.data.message || 'You cannot communicate with this user.');
        }
        throw error;
    }
};

export const sendGift = async (chatId: string, giftIds: string[], content?: string) => {
    try {
        const response = await apiClient.post('/chat/messages/gift', { chatId, giftIds, content });
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 403 && error.response?.data?.blocked) {
            throw new Error(error.response.data.message || 'You cannot communicate with this user.');
        }
        throw error;
    }
};

export const getAvailableGifts = async () => {
    const response = await apiClient.get('/chat/gifts');
    return response.data.data.gifts;
};

export const getGiftHistory = async () => {
    const response = await apiClient.get('/chat/history/gifts');
    return response.data.data.history;
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
    getAvailableGifts,
    getGiftHistory,
};
