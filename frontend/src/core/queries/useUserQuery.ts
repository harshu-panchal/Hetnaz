/**
 * User Queries
 * @purpose: Manage current logged-in user state with React Query
 * 
 * Features:
 * - Caches user profile indefinitely (staleTime: Infinity) until explicitly invalidated
 * - Handles optimistic updates for profile changes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../services/user.service';
import { mapUserToProfile } from '../utils/auth';
import { UserProfile } from '../../types/global';

export const USER_KEYS = {
    me: ['user', 'me'] as const,
    stats: ['user', 'stats'] as const,
};

export const useCurrentUser = () => {
    return useQuery({
        queryKey: USER_KEYS.me,
        queryFn: async () => {
            const rawUser = await userService.getMyProfile();
            return mapUserToProfile(rawUser);
        },
        // User profile rarely changes, so we keep it fresh for a long time
        // reducing /users/me calls significantly
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });
};

export const useUserStats = () => {
    return useQuery({
        queryKey: USER_KEYS.stats,
        queryFn: async () => {
            const stats = await userService.getMeStats();
            return stats;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<UserProfile>) => userService.updateMyProfile(data),
        onSuccess: (updatedUser) => {
            // Update cache immediately
            queryClient.setQueryData(USER_KEYS.me, mapUserToProfile(updatedUser));
        },
    });
};
