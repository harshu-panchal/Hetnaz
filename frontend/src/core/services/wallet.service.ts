/**
 * Wallet Service - Frontend API Client for Coin Economy
 * @purpose: Handle API calls for coin plans, purchases, withdrawals, and transactions
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
// COIN PLANS
// ========================

/**
 * Get all active coin plans (for display on purchase page)
 */
export const getCoinPlans = async () => {
    const response = await axios.get(`${API_URL}/wallet/coin-plans`);
    return response.data.data.plans;
};

/**
 * Get all coin plans including inactive (Admin only)
 */
export const getAllCoinPlans = async () => {
    const response = await axios.get(`${API_URL}/wallet/admin/coin-plans`, {
        headers: getAuthHeaders(),
    });
    return response.data.data.plans;
};

/**
 * Create a new coin plan (Admin only)
 */
export const createCoinPlan = async (planData: {
    name: string;
    tier: 'basic' | 'silver' | 'gold' | 'platinum';
    priceInINR: number;
    baseCoins: number;
    bonusCoins?: number;
    badge?: string | null;
    displayOrder?: number;
    description?: string;
}) => {
    const response = await axios.post(`${API_URL}/wallet/admin/coin-plans`, planData, {
        headers: getAuthHeaders(),
    });
    return response.data.data.plan;
};

/**
 * Update a coin plan (Admin only)
 */
export const updateCoinPlan = async (planId: string, updates: Partial<{
    name: string;
    tier: string;
    priceInINR: number;
    baseCoins: number;
    bonusCoins: number;
    badge: string | null;
    displayOrder: number;
    description: string;
    isActive: boolean;
}>) => {
    const response = await axios.patch(`${API_URL}/wallet/admin/coin-plans/${planId}`, updates, {
        headers: getAuthHeaders(),
    });
    return response.data.data.plan;
};

/**
 * Delete (deactivate) a coin plan (Admin only)
 */
export const deleteCoinPlan = async (planId: string) => {
    const response = await axios.delete(`${API_URL}/wallet/admin/coin-plans/${planId}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// ========================
// PAYOUT SLABS (Admin only)
// ========================

/**
 * Get all payout slabs
 */
export const getPayoutSlabs = async () => {
    const response = await axios.get(`${API_URL}/wallet/admin/payout-slabs`, {
        headers: getAuthHeaders(),
    });
    return response.data.data.slabs;
};

/**
 * Create a payout slab
 */
export const createPayoutSlab = async (slabData: {
    minCoins: number;
    maxCoins: number | null;
    payoutPercentage: number;
    displayOrder?: number;
}) => {
    const response = await axios.post(`${API_URL}/wallet/admin/payout-slabs`, slabData, {
        headers: getAuthHeaders(),
    });
    return response.data.data.slab;
};

/**
 * Update a payout slab
 */
export const updatePayoutSlab = async (slabId: string, updates: Partial<{
    minCoins: number;
    maxCoins: number | null;
    payoutPercentage: number;
    displayOrder: number;
    isActive: boolean;
}>) => {
    const response = await axios.patch(`${API_URL}/wallet/admin/payout-slabs/${slabId}`, updates, {
        headers: getAuthHeaders(),
    });
    return response.data.data.slab;
};

/**
 * Delete (deactivate) a payout slab
 */
export const deletePayoutSlab = async (slabId: string) => {
    const response = await axios.delete(`${API_URL}/wallet/admin/payout-slabs/${slabId}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// ========================
// BALANCE & TRANSACTIONS
// ========================

/**
 * Get current user's coin balance
 */
export const getMyBalance = async () => {
    const response = await axios.get(`${API_URL}/wallet/balance`, {
        headers: getAuthHeaders(),
    });
    return response.data.data;
};

// Alias for getMyBalance
export const getBalance = getMyBalance;

/**
 * Get available gifts
 */
export const getGifts = async () => {
    const response = await axios.get(`${API_URL}/chat/gifts`, {
        headers: getAuthHeaders(),
    });
    return response.data.data;
};

/**
 * Get current user's transaction history
 */
export const getMyTransactions = async (params?: {
    type?: string;
    direction?: 'credit' | 'debit';
    page?: number;
    limit?: number;
}) => {
    const response = await axios.get(`${API_URL}/wallet/transactions`, {
        headers: getAuthHeaders(),
        params,
    });
    return response.data.data;
};

/**
 * Get all transactions (Admin only)
 */
export const getAllTransactions = async (params?: {
    type?: string;
    direction?: 'credit' | 'debit';
    userId?: string;
    page?: number;
    limit?: number;
}) => {
    const response = await axios.get(`${API_URL}/wallet/admin/transactions`, {
        headers: getAuthHeaders(),
        params,
    });
    return response.data.data;
};

// ========================
// WITHDRAWALS (Female)
// ========================

/**
 * Request a withdrawal (Female only)
 */
export const requestWithdrawal = async (data: {
    coinsRequested: number;
    payoutMethod: 'UPI' | 'bank';
    payoutDetails: {
        upiId?: string;
        accountHolderName?: string;
        accountNumber?: string;
        ifscCode?: string;
        bankName?: string;
    };
}) => {
    const response = await axios.post(`${API_URL}/wallet/withdrawals`, data, {
        headers: getAuthHeaders(),
    });
    return response.data.data.withdrawal;
};

/**
 * Get my withdrawal requests (Female only)
 */
export const getMyWithdrawals = async (params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
    page?: number;
    limit?: number;
}) => {
    const response = await axios.get(`${API_URL}/wallet/withdrawals`, {
        headers: getAuthHeaders(),
        params,
    });
    return response.data.data;
};

/**
 * Cancel a pending withdrawal (Female only)
 */
export const cancelWithdrawal = async (withdrawalId: string) => {
    const response = await axios.patch(`${API_URL}/wallet/withdrawals/${withdrawalId}/cancel`, {}, {
        headers: getAuthHeaders(),
    });
    return response.data.data.withdrawal;
};

// ========================
// WITHDRAWALS (Admin)
// ========================

/**
 * Get all withdrawals (Admin only)
 */
export const getPendingWithdrawals = async (params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
    page?: number;
    limit?: number;
}) => {
    const response = await axios.get(`${API_URL}/wallet/admin/withdrawals`, {
        headers: getAuthHeaders(),
        params,
    });
    return response.data.data;
};

/**
 * Approve a withdrawal (Admin only)
 */
export const approveWithdrawal = async (withdrawalId: string) => {
    const response = await axios.patch(`${API_URL}/wallet/admin/withdrawals/${withdrawalId}/approve`, {}, {
        headers: getAuthHeaders(),
    });
    return response.data.data;
};

/**
 * Reject a withdrawal (Admin only)
 */
export const rejectWithdrawal = async (withdrawalId: string, reason: string) => {
    const response = await axios.patch(`${API_URL}/wallet/admin/withdrawals/${withdrawalId}/reject`, { reason }, {
        headers: getAuthHeaders(),
    });
    return response.data.data;
};

/**
 * Mark withdrawal as paid (Admin only)
 */
export const markWithdrawalPaid = async (withdrawalId: string, paymentTransactionId?: string) => {
    const response = await axios.patch(`${API_URL}/wallet/admin/withdrawals/${withdrawalId}/paid`, { paymentTransactionId }, {
        headers: getAuthHeaders(),
    });
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
