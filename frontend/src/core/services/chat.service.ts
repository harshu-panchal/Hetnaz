import apiClient from '../api/client';

// ========================
// CHAT LIST & MANAGEMENT
// ========================

export const getMyChatList = async () => {
    const language = localStorage.getItem('user_language') || 'en';
    const response = await apiClient.get('/chat/chats', {
        params: { language }
    });
    return response.data.data.chats;
};

export const getOrCreateChat = async (otherUserId: string) => {
    const language = localStorage.getItem('user_language') || 'en';
    const response = await apiClient.post('/chat/chats', { otherUserId }, {
        params: { language }
    });
    return response.data.data.chat;
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
    const payload: any = { chatId, content, messageType };

    if (messageType === 'image' && imageUrl) {
        payload.attachments = [{ type: 'image', url: imageUrl }];
    }

    const response = await apiClient.post('/chat/messages', payload);
    return response.data.data;
};

export const sendHiMessage = async (receiverId: string) => {
    const response = await apiClient.post('/chat/messages/hi', { receiverId });
    return response.data.data;
};

export const sendGift = async (chatId: string, giftIds: string[], content?: string) => {
    const response = await apiClient.post('/chat/messages/gift', { chatId, giftIds, content });
    return response.data.data;
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
