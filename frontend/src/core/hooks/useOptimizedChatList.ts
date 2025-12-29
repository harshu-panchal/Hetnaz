import { useState, useEffect, useCallback } from 'react';
import chatService from '../services/chat.service';
import indexedDBCache from '../services/indexedDB.service';
import type { Chat as ApiChat } from '../types/chat.types';

export const useOptimizedChatList = () => {
    const [chats, setChats] = useState<ApiChat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load from cache first
    useEffect(() => {
        const loadFromCache = async () => {
            try {
                const cachedChats = await indexedDBCache.getChatList();
                if (cachedChats && cachedChats.length > 0) {
                    setChats(cachedChats);
                    setIsLoading(false); // Show content immediately found in cache
                }
            } catch (err) {
                console.warn('Failed to load chats from cache:', err);
            }
        };

        loadFromCache();
    }, []);

    // Fetch from network and update cache
    const fetchChats = useCallback(async (force = false) => {
        // Only set loading if we don't have existing chats or if force is true
        // This prevents UI flicker when refreshing background data
        if (chats.length === 0 || force) {
            setIsLoading(true);
        }

        try {
            const data = await chatService.getMyChatList();

            // Update state
            setChats(data);
            setError(null);

            // Background update: Save to cache
            indexedDBCache.saveChatList(data).catch(err => {
                console.warn('Failed to update chat list cache:', err);
            });

        } catch (err: any) {
            console.error('Failed to fetch chats from network:', err);

            // Only set error if we have no data at all (neither cache nor network)
            if (chats.length === 0) {
                setError(err.response?.data?.message || 'Failed to load chats');
            }
        } finally {
            setIsLoading(false);
        }
    }, [chats.length]);

    return {
        chats,
        isLoading,
        error,
        refreshChats: () => fetchChats(false) // Trigger background refresh
    };
};
