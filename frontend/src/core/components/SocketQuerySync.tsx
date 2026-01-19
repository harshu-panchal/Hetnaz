import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import socketService from '../services/socket.service';
import { CHAT_KEYS } from '../queries/useChatQuery';
import { DISCOVERY_KEYS } from '../queries/useDiscoveryQuery';

/**
 * SocketQuerySync - Global component to sync real-time socket events with TanStack Query cache.
 * This ensures that online status updates are reflected across all components instantly
 * without requiring a full page refresh or query invalidation (surgical updates).
 */
export const SocketQuerySync = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Handle user going online
        const handleUserOnline = (data: { userId: string }) => {
            const { userId } = data;
            if (!userId) return;

            console.log(`[SocketQuerySync] User online: ${userId}`);

            // 1. Update Chat List Cache
            queryClient.setQueriesData({ queryKey: CHAT_KEYS.lists() }, (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                return oldData.map((chat: any) => {
                    if (chat.otherUser?._id === userId || chat.otherUser?.id === userId) {
                        return {
                            ...chat,
                            otherUser: { ...chat.otherUser, isOnline: true }
                        };
                    }
                    return chat;
                });
            });

            // 2. Update Discovery List Cache
            queryClient.setQueriesData({ queryKey: DISCOVERY_KEYS.all }, (oldData: any) => {
                // Discovery data might be an array or { profiles: [] } depending on how it's stored
                if (!oldData) return oldData;

                const updateProfiles = (profiles: any[]) => {
                    return profiles.map((p: any) => {
                        if (p.id === userId || p._id === userId) {
                            return { ...p, isOnline: true };
                        }
                        return p;
                    });
                };

                if (Array.isArray(oldData)) return updateProfiles(oldData);
                if (oldData.profiles && Array.isArray(oldData.profiles)) {
                    return { ...oldData, profiles: updateProfiles(oldData.profiles) };
                }
                return oldData;
            });

            // 3. Update specific Chat Detail if it exists
            queryClient.setQueriesData({ queryKey: ['chats', 'detail'] }, (oldData: any) => {
                if (!oldData || !oldData.otherUser) return oldData;
                if (oldData.otherUser._id === userId || oldData.otherUser.id === userId) {
                    return {
                        ...oldData,
                        otherUser: { ...oldData.otherUser, isOnline: true }
                    };
                }
                return oldData;
            });
        };

        // Handle user going offline
        const handleUserOffline = (data: { userId: string; lastSeen?: string }) => {
            const { userId, lastSeen } = data;
            if (!userId) return;

            console.log(`[SocketQuerySync] User offline: ${userId}`);

            const lastSeenDate = lastSeen || new Date().toISOString();

            // 1. Update Chat List Cache
            queryClient.setQueriesData({ queryKey: CHAT_KEYS.lists() }, (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                return oldData.map((chat: any) => {
                    if (chat.otherUser?._id === userId || chat.otherUser?.id === userId) {
                        return {
                            ...chat,
                            otherUser: { ...chat.otherUser, isOnline: false, lastSeen: lastSeenDate }
                        };
                    }
                    return chat;
                });
            });

            // 2. Update Discovery List Cache
            queryClient.setQueriesData({ queryKey: DISCOVERY_KEYS.all }, (oldData: any) => {
                if (!oldData) return oldData;

                const updateProfiles = (profiles: any[]) => {
                    return profiles.map((p: any) => {
                        if (p.id === userId || p._id === userId) {
                            return { ...p, isOnline: false, lastSeen: lastSeenDate };
                        }
                        return p;
                    });
                };

                if (Array.isArray(oldData)) return updateProfiles(oldData);
                if (oldData.profiles && Array.isArray(oldData.profiles)) {
                    return { ...oldData, profiles: updateProfiles(oldData.profiles) };
                }
                return oldData;
            });

            // 3. Update specific Chat Detail if it exists
            queryClient.setQueriesData({ queryKey: ['chats', 'detail'] }, (oldData: any) => {
                if (!oldData || !oldData.otherUser) return oldData;
                if (oldData.otherUser._id === userId || oldData.otherUser.id === userId) {
                    return {
                        ...oldData,
                        otherUser: { ...oldData.otherUser, isOnline: false, lastSeen: lastSeenDate }
                    };
                }
                return oldData;
            });
        };

        // Handle new message (implicitly means sender is online)
        const handleNewMessage = (data: { chatId: string; message: any }) => {
            const senderId = typeof data.message.senderId === 'object'
                ? data.message.senderId._id || data.message.senderId.id
                : data.message.senderId;

            if (senderId) {
                handleUserOnline({ userId: senderId });
            }
        };

        // Subscribe to socket events
        socketService.on('user:online', handleUserOnline);
        socketService.on('user:offline', handleUserOffline);
        socketService.on('message:new', handleNewMessage);
        socketService.on('message:notification', handleNewMessage);

        return () => {
            // Unsubscribe on unmount
            socketService.off('user:online', handleUserOnline);
            socketService.off('user:offline', handleUserOffline);
            socketService.off('message:new', handleNewMessage);
            socketService.off('message:notification', handleNewMessage);
        };
    }, [queryClient]);

    return null; // This component doesn't render anything
};
