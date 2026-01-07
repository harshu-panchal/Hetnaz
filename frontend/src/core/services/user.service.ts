import apiClient from '../api/client';

export interface DiscoverProfile {
    id: string;
    name: string;
    age?: number;
    avatar: string | null;
    bio?: string;
    occupation?: string;
    location?: string;
    isOnline: boolean;
    distance?: string | number;
    chatCost: number;
    latitude?: number;
    longitude?: number;
}

export interface UserProfile {
    id: string;
    name: string;
    age?: number;
    avatar: string | null;
    photos: Array<{ url: string; isPrimary?: boolean }>;
    bio?: string;
    occupation?: string;
    location?: string;
    interests: string[];
    isOnline: boolean;
    lastSeen?: string;
}

export const discoverFemales = async (filter: string = 'all', page: number = 1, limit: number = 50) => {
    const language = localStorage.getItem('user_language') || 'en';

    const response = await apiClient.get('/users/discover', {
        params: {
            filter,
            page,
            limit,
            language
        }
    });
    return response.data.data;
};

export const getUserProfile = async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data.data.user;
};

export const getMyProfile = async () => {
    const response = await apiClient.get('/users/me');
    return response.data.data.user;
};

export const updateMyProfile = async (data: any) => {
    const response = await apiClient.patch('/users/me', data);
    return response.data.data.user;
};

export const getMeStats = async () => {
    const response = await apiClient.get('/users/me/stats');
    return response.data.data.stats;
};

export const getFemaleDashboardData = async () => {
    const response = await apiClient.get('/users/female/dashboard');
    return response.data.data;
};

export const blockUser = async (targetUserId: string) => {
    const response = await apiClient.post('/users/block', { targetUserId });
    return response.data;
};

export const unblockUser = async (targetUserId: string) => {
    const response = await apiClient.post('/users/unblock', { targetUserId });
    return response.data;
};

export const deleteChat = async (chatId: string) => {
    const response = await apiClient.delete(`/users/chats/${chatId}`);
    return response.data;
};

export const deleteMyAccount = async () => {
    const response = await apiClient.delete('/users/me');
    return response.data;
};

// Export as default object
export default {
    getMeStats,
    discoverFemales,
    getUserProfile,
    getMyProfile,
    updateMyProfile,
    getFemaleDashboardData,
    getFemaleEarnings: async () => {
        const response = await apiClient.get('/users/female/dashboard/earnings');
        return response.data.data;
    },
    getFemaleStats: async () => {
        const response = await apiClient.get('/users/female/dashboard/stats');
        return response.data.data;
    },
    getFemaleChats: async () => {
        const response = await apiClient.get('/users/female/dashboard/chats');
        return response.data.data;
    },
    blockUser,
    unblockUser,
    deleteChat,
    deleteMyAccount,
};
