import apiClient from '../api/client';

// ========================
// COIN PLANS
// ========================

export const getCoinPlans = async () => {
    const response = await apiClient.get('/wallet/coin-plans');
    return response.data.data.plans;
};

/**
 * Get all coin plans including inactive (Admin only)
 */
export const getAllCoinPlans = async () => {
    const response = await apiClient.get('/wallet/admin/coin-plans');
    return response.data.data.plans;
};

export const createCoinPlan = async (planData: any) => {
    const response = await apiClient.post('/wallet/admin/coin-plans', planData);
    return response.data.data.plan;
};

export const updateCoinPlan = async (planId: string, updates: any) => {
    const response = await apiClient.patch(`/wallet/admin/coin-plans/${planId}`, updates);
    return response.data.data.plan;
};

export const deleteCoinPlan = async (planId: string) => {
    const response = await apiClient.delete(`/wallet/admin/coin-plans/${planId}`);
    return response.data;
};

export const getPayoutSlabs = async () => {
    const response = await apiClient.get('/wallet/admin/payout-slabs');
    return response.data.data.slabs;
};

export const createPayoutSlab = async (slabData: any) => {
    const response = await apiClient.post('/wallet/admin/payout-slabs', slabData);
    return response.data.data.slab;
};

export const updatePayoutSlab = async (slabId: string, updates: any) => {
    const response = await apiClient.patch(`/wallet/admin/payout-slabs/${slabId}`, updates);
    return response.data.data.slab;
};

export const deletePayoutSlab = async (slabId: string) => {
    const response = await apiClient.delete(`/wallet/admin/payout-slabs/${slabId}`);
    return response.data;
};

export const getMyBalance = async () => {
    const response = await apiClient.get('/wallet/balance');
    return response.data.data;
};

export const getBalance = getMyBalance;

export const getGifts = async () => {
    const response = await apiClient.get('/chat/gifts');
    return response.data.data;
};

export const getMyTransactions = async (params?: any) => {
    const response = await apiClient.get('/wallet/transactions', { params });
    return response.data.data;
};

export const getEarningsSummary = async () => {
    const response = await apiClient.get('/wallet/earnings-summary');
    return response.data.data;
};

export const getMyReferrals = async (params?: any) => {
    const response = await apiClient.get('/wallet/referrals', { params });
    return response.data.data;
};

export const getAllTransactions = async (params?: any) => {
    const response = await apiClient.get('/wallet/admin/transactions', { params });
    return response.data.data;
};

export const requestWithdrawal = async (data: any) => {
    const response = await apiClient.post('/wallet/withdrawals', data);
    return response.data.data.withdrawal;
};

export const getMyWithdrawals = async (params?: any) => {
    const response = await apiClient.get('/wallet/withdrawals', { params });
    return response.data.data;
};

export const cancelWithdrawal = async (withdrawalId: string) => {
    const response = await apiClient.patch(`/wallet/withdrawals/${withdrawalId}/cancel`);
    return response.data.data.withdrawal;
};

export const getPendingWithdrawals = async (params?: any) => {
    const response = await apiClient.get('/wallet/admin/withdrawals', { params });
    return response.data.data;
};

export const approveWithdrawal = async (withdrawalId: string) => {
    const response = await apiClient.patch(`/wallet/admin/withdrawals/${withdrawalId}/approve`);
    return response.data.data;
};

export const rejectWithdrawal = async (withdrawalId: string, reason: string) => {
    const response = await apiClient.patch(`/wallet/admin/withdrawals/${withdrawalId}/reject`, { reason });
    return response.data.data;
};

export const markWithdrawalPaid = async (withdrawalId: string, paymentTransactionId?: string) => {
    const response = await apiClient.patch(`/wallet/admin/withdrawals/${withdrawalId}/paid`, { paymentTransactionId });
    return response.data.data;
};

// Export as default object for convenience
export default {
    // Coin Plans
    getCoinPlans,
    getAllCoinPlans,
    createCoinPlan,
    updateCoinPlan,
    deleteCoinPlan,
    // Payout Slabs
    getPayoutSlabs,
    createPayoutSlab,
    updatePayoutSlab,
    deletePayoutSlab,
    // Balance & Transactions
    getMyBalance,
    getBalance,
    getGifts,
    getMyTransactions,
    getEarningsSummary,
    getMyReferrals,
    getAllTransactions,
    // Withdrawals (Female)
    requestWithdrawal,
    getMyWithdrawals,
    cancelWithdrawal,
    // Withdrawals (Admin)
    getPendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    markWithdrawalPaid,
};
