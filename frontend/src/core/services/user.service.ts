/**
 * User Service - Frontend API Client for User Operations
 * @purpose: Handle API calls for user discovery and profiles
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

export interface DiscoverProfile {
    id: string;
    name: string;
    age?: number;
    avatar: string | null;
    bio?: string;
    occupation?: string;
    location?: string;
    isOnline: boolean;
    distance: string;
    chatCost: number;
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

/**
 * Get approved females for discover page
 */
export const discoverFemales = async (filter: string = 'all', page: number = 1, limit: number = 50) => {
    const response = await axios.get(`${API_URL}/users/discover`, {
        headers: getAuthHeaders(),
        params: { filter, page, limit }
    });
    return response.data.data;
};

/**
 * Get a specific user's profile
 */
export const getUserProfile = async (userId: string) => {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: getAuthHeaders(),
    });
    return response.data.data.user;
};

/**
 * Get current user's profile
 */
export const getMyProfile = async () => {
    const response = await axios.get(`${API_URL}/users/me`, {
        headers: getAuthHeaders(),
    });
    return response.data.data.user;
};

/**
 * Update current user's profile
 */
export const updateMyProfile = async (data: Partial<UserProfile>) => {
    const response = await axios.patch(`${API_URL}/users/me`, data, {
        headers: getAuthHeaders(),
    });
    return response.data.data.user;
};

// Export as default object
export default {
    discoverFemales,
    getUserProfile,
    getMyProfile,
    updateMyProfile,
};
