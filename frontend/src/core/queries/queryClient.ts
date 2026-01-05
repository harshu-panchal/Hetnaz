/**
 * Query Client Configuration
 * @purpose: Centralized React Query client with "Safety First" caching strategies
 * to ensure lightning fast UI and zero backend overload.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data remains fresh for 2 minutes (no refetching)
            staleTime: 1000 * 60 * 2,

            // Keep unused data in garbage collection for 10 minutes
            gcTime: 1000 * 60 * 10,

            // If request fails, retry only once to avoid server spam
            retry: 1,

            // Do not refetch on window focus by default (prevents jitter)
            refetchOnWindowFocus: false,

            // Do not refetch on mount if data is cached
            refetchOnMount: false,
        },
        mutations: {
            // No retries on mutations (POST/PUT/DELETE) to prevent double-charging or duplicate messages
            retry: 0,
        },
    },
});
