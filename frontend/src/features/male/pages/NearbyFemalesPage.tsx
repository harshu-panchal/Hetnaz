import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/TopAppBar';
import { FilterChips } from '../components/FilterChips';
import { FilterPanel, type FilterOptions } from '../components/FilterPanel';
import { ProfileCard } from '../components/ProfileCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { BottomNavigation } from '../components/BottomNavigation';
import type { NearbyFemale, FilterType } from '../types/male.types';

// Mock data - replace with actual API calls
const mockProfiles: NearbyFemale[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 23,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNnKyZLNWCV7B-XwKgjd9-bbG9ZSq583oYGij7uKTYk2Ah_9nkpqgsGSDu-FUgux5QDiLCTw_y9JxTBhkZjWAOOReMhlK98A_84vIsKaxQ0IUzZqkJ7-wnAv67HRuUVltC2QQzOfbTk1-OdjqC7SWT4iG-MXs81ePZK3x1mYOHabRqp4eH7yIfiX3tH-YMXSs1uWS41vrxzPC8_MJHasLGiUWINfHYQ7KF2jfo0n_Yo6qBJKr_qMrOBUdimUVVJdY46GD7L0v-oL4',
    distance: '1.2 km',
    isOnline: true,
    occupation: 'Student',
    chatCost: 20,
  },
  {
    id: '2',
    name: 'Jessica',
    age: 25,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHxrviFMtsvG_Idvc-7NLJcibIA3HzpSimrSGtu5nkdVXQ0lR_v5vA3Ze5PcHiEZqXs444SJmue_gn-BAJpC_N4OBtiZ76IDvr9bLR_SxT5dQNp7j5WAWAzR9Cc6wdHAOpqLvxURxJbRcG1oN1Y1usF6uro9rSV6FLFxuNnpI_KIDdXzO8GH9BtmEm-Da4mrHV39aDrH-gGMTms5x6GJrf9pvOpfKnux5C1cD8_KgfRomNHp0HOgf-8TefyOTLXglCq3P1RsbOOf8',
    distance: '3.5 km',
    isOnline: false,
    occupation: 'Designer',
    chatCost: 20,
  },
  {
    id: '3',
    name: 'Emily',
    age: 21,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMwDNlS8xIMG2GPDOruau0I96EJW8UAfXypa6c3-bkakWGNwuNHv4bT_JxAS2tQQbwxDbRjkJCejmcZYfsqqtKJ-7OeHLwq5E9n5xOPyVwVLwv6bLTSaWBddBnCfSb85sZZW5ciF9ASv_TmzTFU3HcRlJPBSmBmvslJ_3dhEuuYLb5gfEYKw8ahTEUs9Nr49VBtnu-s1Y--7W9Kv1e7XebTvnXhrZ42e1cYEMDxGbgmAHw0fTnNAuBciEyspzTK1qCjMHkoxWkXPw',
    distance: '500 m',
    isOnline: true,
    bio: 'New here 👋',
    chatCost: 20,
  },
  {
    id: '4',
    name: 'Chloe',
    age: 24,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2mvDb9KljJsn2Es0tMin1X8x7oWZzzM3oSqicuGZv59l_xX94LRX0yvfZVhu_71b1kQMWDjj1vAMUId07GeEgPrRa5dVad2KZVCEmT750i0TFrgMCxSmG1irjUPlGTnq4UJQfCwJ2e33JcF1mxTovGHbxGYH9pMtpzypp4kcuNNapws-eKB5NidDoGSmpYJO3-tQ9hO0iTXnTq-GCL0qvtkWkQgkJAPwl7fwYiCH_RoXSRDVToXhkpx8YMuZo6YVcUzl7EKDGW0M',
    distance: '5 km',
    isOnline: false,
    occupation: 'Model',
    chatCost: 20,
  },
  {
    id: '5',
    name: 'Ava',
    age: 22,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJS0wNq7_DHk8VHFnFL9uBHN9_dgt046SyWzs9k_WQecLMOjUgs0OxGn5yAVpXGJ0trtwW2MkIXPiZcD3T9KtBy7uFn1ckM1xSYEg-85-HFtjhrUO3mJVkgOToIIDYn9TJ4gn9OBB1qSAqgVwuZeKvAcTXV-CIAm5MAIGjhy2TlmeWLnc-ew1SijQ6xHe5uTolQwSSJ0NoJDt6IsYsLQpvfql_VV4DiR0WsPreKJS-mkw9Z2-VygM5pbGasq81ij_Otu1K-sFC33E',
    distance: '8 km',
    isOnline: true,
    bio: 'Looking for friends',
    chatCost: 20,
  },
  {
    id: '6',
    name: 'Mia',
    age: 20,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpxGBSL7DN3RZTDICRQvq0bH7dVoCLYq63lu3YCKiKDUE8PJLHpY_WX1U274YFz9O6Duw9sn7jGmiuIJMUK3F_c8li9Fo4dXiPW3-p6iGcIrw3O6qX79XjjjJvj6PQ1Y8294LjVroByfHmKpyhfpskyXTL1Rk_ivSgEuwxMWxy2jRwsyairF-hkeYGQmdclif4z8Jzbgp7V8jRZYnrWGWdGXnxQWkJPf2DXWpR1XeD5jWTLGeydgJcOpqlfrdQch5-ee8S5FsLkZE',
    distance: '12 km',
    isOnline: false,
    occupation: 'Traveler',
    chatCost: 20,
  },
];

const navigationItems = [
  { id: 'discover', icon: 'explore', label: 'Discover', isActive: true },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats', hasBadge: true },
  { id: 'wallet', icon: 'monetization_on', label: 'Wallet' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

export const NearbyFemalesPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    ageRange: { min: 18, max: 50 },
    maxDistance: 50,
    onlineOnly: false,
    verifiedOnly: false,
  });

  const filteredProfiles = useMemo(() => {
    let profiles = mockProfiles;

    // Apply filter chips
    switch (activeFilter) {
      case 'online':
        profiles = profiles.filter((profile) => profile.isOnline);
        break;
      case 'new':
        profiles = profiles.filter((profile) => profile.bio?.includes('New here'));
        break;
      case 'popular':
        // Mock: could be based on views, matches, etc.
        profiles = profiles.slice(0, 3);
        break;
      default:
        break;
    }

    // Apply advanced filters
    profiles = profiles.filter((profile) => {
      // Age filter
      if (profile.age < filterOptions.ageRange.min || profile.age > filterOptions.ageRange.max) {
        return false;
      }

      // Distance filter (parse distance string like "1.2 km" or "500 m")
      const distanceStr = profile.distance.toLowerCase();
      let distanceKm = 0;
      if (distanceStr.includes('km')) {
        distanceKm = parseFloat(distanceStr.replace('km', '').trim());
      } else if (distanceStr.includes('m')) {
        distanceKm = parseFloat(distanceStr.replace('m', '').trim()) / 1000;
      }
      if (distanceKm > filterOptions.maxDistance) {
        return false;
      }

      // Online only filter
      if (filterOptions.onlineOnly && !profile.isOnline) {
        return false;
      }

      // Verified only filter (mock - assume some profiles are verified)
      // In real app, this would check a verified property
      if (filterOptions.verifiedOnly) {
        // Mock: consider profiles with occupation as verified
        if (!profile.occupation) {
          return false;
        }
      }

      return true;
    });

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      profiles = profiles.filter((profile) => {
        const nameMatch = profile.name.toLowerCase().includes(query);
        const occupationMatch = profile.occupation?.toLowerCase().includes(query);
        const bioMatch = profile.bio?.toLowerCase().includes(query);
        return nameMatch || occupationMatch || bioMatch;
      });
    }

    return profiles;
  }, [activeFilter, searchQuery, filterOptions]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterClick = () => {
    setIsFilterPanelOpen(true);
  };

  const handleFilterApply = (filters: FilterOptions) => {
    setFilterOptions(filters);
  };

  const handleChatClick = (profileId: string) => {
    // Navigate to chat - create new chat or open existing
    navigate(`/chat/${profileId}`);
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  const handleGetCoinsClick = () => {
    navigate('/buy-coins');
  };

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'discover':
        navigate('/discover');
        break;
      case 'chats':
        navigate('/chats');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'profile':
        navigate('/my-profile');
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      {/* Top App Bar */}
      <TopAppBar
        title="Nearby"
        icon="favorite"
        onFilterClick={handleFilterClick}
        onSearch={handleSearch}
      />

      {/* Filter Chips */}
      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={handleFilterApply}
        initialFilters={filterOptions}
      />

      {/* Main Content: Profile Grid */}
      <main className="p-3">
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onChatClick={handleChatClick}
                onProfileClick={handleProfileClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-gray-500 dark:text-[#cc8ea3] text-center">
              {searchQuery.trim()
                ? `No profiles found matching "${searchQuery}"`
                : 'No profiles found'}
            </p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        title="Get Coins"
        subtitle="Boost Profile"
        icon="add"
        onClick={handleGetCoinsClick}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

