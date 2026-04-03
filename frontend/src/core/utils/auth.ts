/**
 * Authentication Utilities
 * @owner: Sujal (Shared - Both review)
 * @purpose: Token management and authentication helpers
 */
import { UserProfile } from '../types/global';

const TOKEN_KEY = 'hetnaz_auth_token';
const REFRESH_TOKEN_KEY = 'hetnaz_refresh_token';
const USER_KEY = 'hetnaz_user';
const AUTH_TIMESTAMP_KEY = 'hetnaz_auth_timestamp';
const LANGUAGE_KEY = 'user_language';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);

  if (token && timestamp) {
    const loginTime = parseInt(timestamp, 10);
    const now = Date.now();
    if (now - loginTime > THIRTY_DAYS_MS) {
      clearAuth();
      return null;
    }
  }
  return token;
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Set refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Get user data from localStorage
 */
export const getUser = (): any | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Set user data in localStorage
 */
export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Clear all auth data and cached user data
 * CRITICAL: Preserves only language preference
 */
export const clearAuth = (): void => {
  // Save language preference
  const savedLanguage = localStorage.getItem(LANGUAGE_KEY);

  // Clear MatchMint related data
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_TIMESTAMP_KEY);

  // Restore language preference if needed (though we didn't remove it specifically above)
  if (savedLanguage) {
    localStorage.setItem(LANGUAGE_KEY, savedLanguage);
  }
};

/**
 * Check if language preference is stored
 */
export const isLanguageSelected = (): boolean => {
  return !!localStorage.getItem(LANGUAGE_KEY);
};

import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchUserProfile = async (): Promise<any> => {
  const token = getAuthToken();
  if (!token) throw new Error('No token found');

  const response = await axios.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data.user;
};

/**
 * Map backend user object to frontend UserProfile
 */
export const mapUserToProfile = (user: any): UserProfile => {
  if (!user) return null as any;

  // Extremely defensive photo extraction
  const profilePhotos = user.profile?.photos || [];
  const primaryPhoto = profilePhotos.find((p: any) => p?.isPrimary)?.url;
  const firstPhoto = profilePhotos[0]?.url;
  const avatarUrl = user.avatarUrl || user.primaryPhoto || primaryPhoto || firstPhoto || '';

  return {
    id: user._id || user.id || 'unknown',
    phoneNumber: user.phoneNumber || '',
    role: user.role || 'user',
    name: user.name || user.fullName || user.profile?.name || 'User',
    avatarUrl: avatarUrl,
    photos: profilePhotos.map((p: any) => typeof p === 'string' ? p : p?.url).filter(Boolean),
    age: parseInt(user.profile?.age, 10) || 18,
    bio: user.profile?.bio || '',
    city: user.profile?.location?.city || user.location || user.city || 'Unknown',
    location: user.profile?.location?.city || user.location || user.city || 'Location not set',
    interests: Array.isArray(user.profile?.interests) ? user.profile.interests : [],
    occupation: user.profile?.occupation || '',
    isVerified: !!user.isVerified,
    approvalStatus: user.approvalStatus || 'pending',
    rejectionReason: user.rejectionReason || '',
    coinBalance: parseInt(user.coinBalance, 10) || 0,
    memberTier: user.memberTier || 'BASIC',
    // Defensive extraction of GeoJSON coordinates [lng, lat]
    latitude: user.profile?.location?.coordinates?.coordinates?.[1] || 0,
    longitude: user.profile?.location?.coordinates?.coordinates?.[0] || 0,
    badges: Array.isArray(user.badges) ? user.badges : (Array.isArray(user.profile?.badges) ? user.profile.badges : []),
    referralId: user.referralId || '',
    referralCount: parseInt(user.referralCount, 10) || 0,
  };
};

