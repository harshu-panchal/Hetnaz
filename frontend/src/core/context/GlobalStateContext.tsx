/**
 * Global State Context - Centralized state management with Socket.IO sync
 * @purpose: Cache user data, balance, and sync via WebSocket for real-time updates
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserProfile } from '../types/global';
import socketService from '../services/socket.service';
import walletService from '../services/wallet.service';
import indexedDBCache from '../services/indexedDB.service';
import { useAuth } from './AuthContext';
import { mapUserToProfile } from '../utils/auth';
import { audioManager } from '../utils/audioManager';

interface GlobalState {
    user: UserProfile | null;
    coinBalance: number;
    isConnected: boolean;

    // Actions
    setUser: (user: any | null) => void;
    updateBalance: (balance: number) => void;
    refreshBalance: () => Promise<void>;
    logout: () => void;
    addNotification: (notification: InAppNotification) => void;
    clearNotification: (id: string) => void;
    notifications: InAppNotification[];
    chatCache: Record<string, any[]>;
    saveToChatCache: (chatId: string, messages: any[]) => void;
    loadFromChatCache: (chatId: string) => Promise<any[]>;
    appSettings: any | null;
}

export interface InAppNotification {
    id: string;
    title: string;
    message: string;
    type: 'message' | 'system' | 'gift';
    chatId?: string;
    userId?: string;
    avatar?: string;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

// Local storage keys
const STORAGE_KEYS = {
    USER: 'matchmint_user',
    TOKEN: 'matchmint_auth_token',
    BALANCE_CACHE: 'matchmint_balance_cache',
    CHAT_CACHE: 'matchmint_chat_cache',
};

interface GlobalStateProviderProps {
    children: ReactNode;
}

export const GlobalStateProvider = ({ children }: GlobalStateProviderProps) => {
    const { user, updateUser } = useAuth();

    const [coinBalance, setCoinBalance] = useState<number>(() => {
        // Initialize from cache
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.BALANCE_CACHE);
            return cached ? parseInt(cached, 10) : 0;
        } catch {
            return 0;
        }
    });

    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [chatCache, setChatCache] = useState<Record<string, any[]>>({});
    const [appSettings, setAppSettings] = useState<any | null>(null);

    // Fetch app settings
    const refreshSettings = useCallback(async () => {
        try {
            const { configService } = await import('../services/config.service');
            const config = await configService.refreshConfig();
            setAppSettings(config);
        } catch (error) {
            console.error('Failed to refresh app settings:', error);
        }
    }, []);

    // Load chat cache from IndexedDB on mount (non-blocking)
    useEffect(() => {
        // This runs in background, doesn't block UI
        const loadChatCache = async () => {
            try {
                const stats = await indexedDBCache.getStats();
                console.log(`📦 IndexedDB cache: ${stats.chatCount} chats, ${stats.messageCount} messages`);
            } catch (e) {
                console.warn('IndexedDB not available, using memory-only cache');
            }
        };
        loadChatCache();
        refreshSettings();
    }, [refreshSettings]);

    const addNotification = useCallback((notification: Omit<InAppNotification, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { ...notification, id }]);

        // Play notification sound
        audioManager.playNotification();

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const saveToChatCache = useCallback((chatId: string, messages: any[]) => {
        const trimmedMessages = messages.slice(-100); // Keep last 100 messages

        // Update in-memory state
        setChatCache(prev => ({
            ...prev,
            [chatId]: trimmedMessages
        }));

        // Persist to IndexedDB (non-blocking)
        indexedDBCache.saveChatMessages(chatId, trimmedMessages).catch(e => {
            console.warn('Failed to persist chat to IndexedDB:', e);
        });
    }, []);

    // Function to load messages from IndexedDB cache
    const loadFromChatCache = useCallback(async (chatId: string): Promise<any[]> => {
        // First check in-memory cache
        if (chatCache[chatId]) {
            return chatCache[chatId];
        }

        // Then try IndexedDB
        try {
            const messages = await indexedDBCache.getChatMessages(chatId);
            if (messages.length > 0) {
                // Update in-memory cache
                setChatCache(prev => ({ ...prev, [chatId]: messages }));
            }
            return messages;
        } catch (e) {
            return [];
        }
    }, [chatCache]);

    // Update user and persist to localStorage
    // setUser mapping
    const setUser = useCallback((newUser: any | null) => {
        if (newUser) {
            updateUser(mapUserToProfile(newUser));
        }
    }, [updateUser]);

    // Update balance and cache
    const updateBalance = useCallback((balance: number) => {
        setCoinBalance(balance);
        localStorage.setItem(STORAGE_KEYS.BALANCE_CACHE, String(balance));
    }, []);

    // Fetch fresh balance from API
    const refreshBalance = useCallback(async () => {
        try {
            const data = await walletService.getBalance();
            // Backend returns { balance: number }, not { coinBalance }
            updateBalance(data.balance || data.coinBalance || 0);
        } catch (error) {
            console.error('Failed to refresh balance:', error);
        }
    }, [updateBalance]);

    // Logout
    const logoutAction = useCallback(() => {
        socketService.disconnect();
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.BALANCE_CACHE);
        setCoinBalance(0);
        // AuthContext.logout will be handled by the logout button in components
    }, []);

    // Socket.IO event listeners
    useEffect(() => {
        if (!user) return;

        // Connect to socket
        socketService.connect();

        // Handle connection status
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        // Handle balance updates - backend sends { balance: number }
        const handleBalanceUpdate = (data: { balance: number }) => {
            updateBalance(data.balance);
        };

        // Handle user updates (profile changes, online status, etc.)
        // Handle user updates (profile changes, online status, etc.)
        const handleUserUpdate = (data: any) => {
            if (data.userId === user?.id) {
                updateUser(mapUserToProfile(data));
            }
        };

        // Handle chat messages
        const handleNewMessage = (data: any) => {
            const chatId = data.chatId || data._id;
            const senderId = data.senderId || data.sender?._id;
            const senderName = data.senderName || data.sender?.name || 'New Message';
            const senderAvatar = data.senderAvatar || data.sender?.avatar;
            const content = data.content || data.message || 'You received a new message';

            // Don't show notification if it's our own message
            if (senderId === user?.id) return;

            // Only show notification if we are not on the chat page for this chatId
            const isInsideThisChat = window.location.pathname.includes(`/chat/${chatId}`);

            if (!isInsideThisChat) {
                addNotification({
                    title: senderName,
                    message: content,
                    type: 'message',
                    chatId: chatId,
                    avatar: senderAvatar
                });
            }
        };

        // Register listeners
        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);
        socketService.on('balance:update', handleBalanceUpdate);
        socketService.on('user:update', handleUserUpdate);
        socketService.on('message', handleNewMessage);
        socketService.on('chat:message', handleNewMessage);
        socketService.on('message:new', handleNewMessage);
        socketService.on('message:notification', handleNewMessage);

        // Initial balance fetch
        refreshBalance();

        return () => {
            socketService.off('connect', handleConnect);
            socketService.off('disconnect', handleDisconnect);
            socketService.off('balance:update', handleBalanceUpdate);
            socketService.off('user:update', handleUserUpdate);
            socketService.off('message', handleNewMessage);
            socketService.off('chat:message', handleNewMessage);
            socketService.off('message:new', handleNewMessage);
            socketService.off('message:notification', handleNewMessage);
        };
    }, [user?.id, updateBalance, refreshBalance, updateUser]);

    const value: GlobalState = {
        user,
        coinBalance,
        isConnected,
        setUser,
        updateBalance,
        refreshBalance,
        logout: logoutAction,
        notifications,
        addNotification,
        clearNotification,
        chatCache,
        saveToChatCache,
        loadFromChatCache,
        appSettings,
    };

    return (
        <GlobalStateContext.Provider value={value}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export const useGlobalState = (): GlobalState => {
    const context = useContext(GlobalStateContext);
    if (context === undefined) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
};

export default GlobalStateContext;
