import apiClient from '../api/client';

export const getDashboardStats = async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data.data;
};

export const listUsers = async (filters: any = {}, page = 1, limit = 20) => {
    const response = await apiClient.get('/admin/users', { params: { ...filters, page, limit } });
    return response.data.data;
};

export const listTransactions = async (filters: any = {}, page = 1, limit = 20) => {
    const response = await apiClient.get('/admin/transactions', { params: { ...filters, page, limit } });
    return response.data.data;
};



export const getAppSettings = async () => {
    const response = await apiClient.get('/admin/settings');
    return response.data.data.settings;
};

export const updateAppSettings = async (settings: any) => {
    const response = await apiClient.patch('/admin/settings', settings);
    return response.data.data.settings;
};

export const listGifts = async () => {
    const response = await apiClient.get('/admin/gifts');
    return response.data.data.gifts;
};

export const updateGiftCost = async (giftId: string, cost: number) => {
    const response = await apiClient.patch(`/admin/gifts/${giftId}/cost`, { cost });
    return response.data.data.gift;
};

export const getPendingFemales = async (status = 'pending', page = 1, limit = 20) => {
    const response = await apiClient.get('/admin/females/pending', {
        params: { status, page, limit }
    });

    // Transform backend user format to FemaleApproval format
    const users = response.data.data.users.map((u: any) => ({
        userId: u._id,
        user: {
            id: u._id,
            phoneNumber: u.phoneNumber,
            name: u.profile?.name,
            role: u.role,
            isBlocked: u.isBlocked,
            isVerified: u.isVerified,
            createdAt: u.createdAt,
            lastLoginAt: u.lastSeen
        },
        profile: {
            age: u.profile?.age,
            city: u.profile?.location?.city || '',
            bio: u.profile?.bio || '',
            photos: u.profile?.photos?.map((p: any) => typeof p === 'string' ? p : p.url) || [],
            location: u.profile?.location?.coordinates ? {
                lat: u.profile.location.coordinates[1],
                lng: u.profile.location.coordinates[0]
            } : undefined
        },
        verificationDocuments: u.verificationDocuments,
        approvalStatus: u.approvalStatus,
        submittedAt: u.createdAt
    }));

    return { users, total: response.data.data.total, stats: response.data.data.stats };
};

export const approveFemale = async (userId: string) => {
    const response = await apiClient.patch(`/admin/females/${userId}/approve`);
    return response.data;
};

export const rejectFemale = async (userId: string, reason: string) => {
    const response = await apiClient.patch(`/admin/females/${userId}/reject`, { reason });
    return response.data;
};

export const requestResubmit = async (userId: string, reason: string) => {
    const response = await apiClient.patch(`/admin/females/${userId}/request-resubmit`, { reason });
    return response.data;
};

export const toggleBlockUser = async (userId: string) => {
    const response = await apiClient.patch(`/admin/users/${userId}/toggle-block`);
    return response.data;
};

export const toggleVerifyUser = async (userId: string) => {
    const response = await apiClient.patch(`/admin/users/${userId}/toggle-verify`);
    return response.data;
};

export const deleteUser = async (userId: string) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
};

// ============== GIFT MANAGEMENT ==============
export const createGift = async (giftData: {
    name: string;
    category: string;
    imageUrl: string;
    cost: number;
    description?: string;
}) => {
    const response = await apiClient.post('/admin/gifts', giftData);
    return response.data.data.gift;
};

export const deleteGift = async (giftId: string) => {
    const response = await apiClient.delete(`/admin/gifts/${giftId}`);
    return response.data;
};

// ============== ADMIN PROFILE MANAGEMENT ==============
export const getAdminProfile = async () => {
    const response = await apiClient.get('/admin/profile');
    return response.data.data;
};

export const requestAdminOtp = async (phoneNumber: string, action: 'add_phone' | 'change_secret') => {
    const response = await apiClient.post('/admin/profile/request-otp', { phoneNumber, action });
    return response.data;
};

export const updateAdminPhone = async (phoneNumber: string, otp: string) => {
    const response = await apiClient.patch('/admin/profile/update-phone', { phoneNumber, otp });
    return response.data;
};

export const updateAdminSecret = async (phoneNumber: string, otp: string, newSecret: string) => {
    const response = await apiClient.patch('/admin/profile/update-secret', { phoneNumber, otp, newSecret });
    return response.data;
};

export const adminService = {
    getDashboardStats,
    listUsers,
    listTransactions,

    getAppSettings,
    updateAppSettings,
    listGifts,
    updateGiftCost,
    createGift,
    deleteGift,
    getPendingFemales,
    approveFemale,
    rejectFemale,
    requestResubmit,
    toggleBlockUser,
    toggleVerifyUser,
    deleteUser,
    getAdminProfile,
    requestAdminOtp,
    updateAdminPhone,
    updateAdminSecret
};

export default adminService;
