/**
 * Chat Queries
 * @purpose: Manage chat lists and messages with infinite scrolling and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import chatService from '../services/chat.service';

export const CHAT_KEYS = {
    all: ['chats'] as const,
    lists: () => [...CHAT_KEYS.all, 'list'] as const,
    detail: (chatId: string) => [...CHAT_KEYS.all, 'detail', chatId] as const,
    messages: (chatId: string) => [...CHAT_KEYS.all, 'messages', chatId] as const,
};

// Fetch list of all chats
export const useChatList = () => {
    return useQuery({
        queryKey: CHAT_KEYS.lists(),
        queryFn: chatService.getMyChatList,
        staleTime: 1000 * 60, // 1 minute stale time (real-time updates handled by socket)
    });
};

// Fetch specific chat details
export const useChatDetail = (chatId: string | undefined) => {
    return useQuery({
        queryKey: CHAT_KEYS.detail(chatId!),
        queryFn: () => chatService.getChatById(chatId!),
        enabled: !!chatId,
        staleTime: 1000 * 60 * 5,
    });
};

// Fetch messages for a chat
export const useChatMessages = (chatId: string | undefined) => {
    return useQuery({
        queryKey: CHAT_KEYS.messages(chatId!),
        queryFn: () => chatService.getChatMessages(chatId!),
        enabled: !!chatId,
        staleTime: Infinity, // Messages shouldn't change historically, only append
    });
};

// Send Message Mutation (Optimistic Update)
export const useSendMessage = (chatId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { content: string; type: 'text' | 'image'; imageUrl?: string }) =>
            chatService.sendMessage(chatId, data.content, data.type, data.imageUrl),

        onMutate: async (newMessage) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: CHAT_KEYS.messages(chatId) });

            // Snapshot the previous value
            const previousMessages = queryClient.getQueryData(CHAT_KEYS.messages(chatId));

            // Optimistically update to the new value
            queryClient.setQueryData(CHAT_KEYS.messages(chatId), (old: any) => {
                const optimisticMsg = {
                    _id: `temp-${Date.now()}`,
                    content: newMessage.content,
                    messageType: newMessage.type,
                    senderId: 'me', // This needs actual ID from context, but for visual list often enough
                    createdAt: new Date().toISOString(),
                    status: 'sending',
                    attachments: newMessage.type === 'image' && newMessage.imageUrl ? [{ url: newMessage.imageUrl }] : []
                };

                // If old is object with data array or just array, handle structure
                // Assuming backend returns { messages: [...] } or just [...]
                const oldMessages = Array.isArray(old) ? old : (old?.messages || []);
                return [...oldMessages, optimisticMsg];
            });

            return { previousMessages };
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            queryClient.setQueryData(CHAT_KEYS.messages(chatId), context?.previousMessages);
        },
        onSettled: () => {
            // Refetch after error or success to ensure sync
            queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messages(chatId) });
        },
    });
};
