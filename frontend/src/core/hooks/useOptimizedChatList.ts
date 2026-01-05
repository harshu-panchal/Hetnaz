import { useChatList } from '../queries/useChatQuery';

export const useOptimizedChatList = () => {
    // TanStack Query handles caching, background refetching, and deduping automatically.
    // staleTime in useChatQuery ensures we read from cache instantly.
    const {
        data: chats = [],
        isLoading,
        error,
        refetch
    } = useChatList();

    // Map React Query error to string if present
    const errorMessage = error ? (error as any).message || 'Failed to load chats' : null;

    return {
        chats,
        isLoading,
        error: errorMessage,
        refreshChats: refetch
    };
};
