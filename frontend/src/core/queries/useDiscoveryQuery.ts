/**
 * Discovery Queries
 * @purpose: Optimized fetching for "Nearby Females" with distance calculation caching
 */

import { useQuery } from '@tanstack/react-query';
import userService from '../services/user.service';
import { useCurrentUser } from './useUserQuery';
import { calculateDistance, formatDistance, areCoordinatesValid } from '../../utils/distanceCalculator';

export const DISCOVERY_KEYS = {
    all: ['discovery'] as const,
    list: (filter: string) => [...DISCOVERY_KEYS.all, 'list', filter] as const,
};

export const useDiscoveryProfiles = (filter: string = 'all') => {
    const { data: currentUser } = useCurrentUser();

    return useQuery({
        queryKey: DISCOVERY_KEYS.list(filter),
        queryFn: () => userService.discoverFemales(filter),
        select: (data) => {
            // Perform heavy data transformation here (memoized)
            // This runs ONLY when data changes, not on every render
            const profiles = (data.profiles || []).map((p: any) => {
                // Calculate distance relative to cached current user
                let distanceStr = p.distance;

                if (currentUser) {
                    const profileCoords = p.profile?.location?.coordinates || [p.longitude, p.latitude];
                    const profileLat = profileCoords[1];
                    const profileLng = profileCoords[0];

                    const userCoord = { lat: currentUser.latitude || 0, lng: currentUser.longitude || 0 };
                    const profileCoord = { lat: profileLat || 0, lng: profileLng || 0 };

                    if (areCoordinatesValid(userCoord) && areCoordinatesValid(profileCoord)) {
                        const dist = calculateDistance(userCoord, profileCoord);
                        distanceStr = formatDistance(dist);
                    }
                }

                return {
                    ...p,
                    id: p.id || p._id,
                    name: p.name || 'Anonymous',
                    avatar: p.avatar || p.profile?.photos?.[0]?.url || '',
                    bio: p.bio || p.profile?.bio || '',
                    location: p.location || p.profile?.location?.city || '',
                    age: p.age || p.profile?.age,
                    distance: distanceStr
                };
            });

            return profiles;
        },
        // Keep discovery list fresh for 10 seconds (online status needs to be relatively fresh)
        staleTime: 1000 * 10,
        // Keep in memory for 5 minutes
        gcTime: 1000 * 60 * 5,
        // Prevent background refetching which causes list jumps
        refetchOnWindowFocus: false,
    });
};
