
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types/global';
import {
    getAuthToken,
    getUser,
    setAuthToken,
    setUser as setStorageUser,
    clearAuth,
    fetchUserProfile,
    mapUserToProfile,
} from '../utils/auth';

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: UserProfile) => void;
    logout: () => void;
    updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Initialize from local storage
        const initAuth = async () => {
            const storedToken = getAuthToken();
            const storedUser = getUser();

            if (storedToken) {
                setToken(storedToken);
                // Optimistically set user from storage immediately (fast path)
                if (storedUser) {
                    const profile = (storedUser._id || storedUser.profile)
                        ? mapUserToProfile(storedUser)
                        : storedUser;
                    setUserState(profile);
                    setIsAuthenticated(true);
                }
                // Set loading to false immediately so UI can render with cached data
                setIsLoading(false);

                // Refresh profile in background (non-blocking)
                try {
                    const rawUser = await fetchUserProfile();
                    const profile = mapUserToProfile(rawUser);
                    setUserState(profile);
                    setStorageUser(profile);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Failed to refresh profile', error);
                    // If 401, token is invalid - clear auth
                    if ((error as any)?.response?.status === 401) {
                        clearAuth();
                        setToken(null);
                        setUserState(null);
                        setIsAuthenticated(false);
                    }
                }
            } else {
                clearAuth();
                setToken(null);
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = React.useCallback((newToken: string, rawUser: any) => {
        const newUser = mapUserToProfile(rawUser);
        setAuthToken(newToken);
        setStorageUser(newUser);
        setToken(newToken);
        setUserState(newUser);
        setIsAuthenticated(true);
    }, []);

    const logout = React.useCallback(() => {
        clearAuth();
        setToken(null);
        setUserState(null);
        setIsAuthenticated(false);
    }, []);

    const updateUser = React.useCallback((updates: Partial<UserProfile>) => {
        setUserState((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            setStorageUser(updated);
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
