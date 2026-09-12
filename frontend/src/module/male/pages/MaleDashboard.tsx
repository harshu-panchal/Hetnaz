import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiscoverFemalesSection } from '../components/DiscoverFemalesSection';
import { FilterPanel, FilterOptions } from '../components/FilterPanel';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useDiscoveryProfiles } from '../../../core/queries/useDiscoveryQuery';
import { DailyRewardModal } from '../../../shared/components/DailyRewardModal';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import apiClient from '../../../core/api/client';

export const MaleDashboard = () => {
  const navigate = useNavigate();
  const { unreadCount, updateBalance } = useGlobalState();

  // Filter state for discovery
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    ageRange: { min: 18, max: 45 },
    maxDistance: 100,
  });

  // Daily Reward Modal
  const [isDailyRewardModalOpen, setIsDailyRewardModalOpen] = useState(false);
  const [dailyRewardData, setDailyRewardData] = useState({ amount: 0, newBalance: 0 });

  // PHASED BOOT: Check and claim daily reward 3 seconds AFTER dashboard mount
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkDailyReward = async () => {
      try {
        const response = await apiClient.post('/rewards/daily/claim');
        const result = response.data.data;

        if (result.claimed) {
          setDailyRewardData({ amount: result.amount, newBalance: result.newBalance });
          setIsDailyRewardModalOpen(true);
          updateBalance(result.newBalance);
        }
      } catch (error) {
        // Silently fail - background task
      }
    };

    timeoutId = setTimeout(checkDailyReward, 3000);
    return () => clearTimeout(timeoutId);
  }, [updateBalance]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Use optimized hook for female profiles
  const { data: nearbyUsersRaw = [], isLoading: isNearbyLoading } = useDiscoveryProfiles('all');

  const handleExploreClick = () => {
    navigate('/male/discover');
  };

  const handleProfileClick = (profileId: string) => {
    const found = nearbyUsersRaw.find((p: any) => (p.id || p._id) === profileId);
    navigate(`/male/profile/${profileId}`, { state: { profile: found } });
  };

  const handleFemaleChatClick = (profileId: string) => {
    navigate(`/male/chat/new_${profileId}`);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="font-display text-ink antialiased selection:bg-pink-500 selection:text-white min-h-screen relative lg:pl-60 overflow-x-hidden">
      
      {/* Scrollable Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen pb-24 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full">
        
        {/* Compact Clean Top Header: Brand + Reduced Notification Icon */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 bg-clip-text text-transparent uppercase">
              Dil Mate
            </span>
          </div>

          {/* Reduced Notification Button */}
          <button
            onClick={() => navigate('/male/notifications')}
            className="relative size-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 hover:text-pink-600 active:scale-90 transition-all"
            aria-label="Notifications"
          >
            <MaterialSymbol name="notifications" size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Recommend and Nearby Girls Section */}
        <DiscoverFemalesSection
          profiles={nearbyUsersRaw}
          isLoading={isNearbyLoading}
          filterOptions={filterOptions}
          onFilterClick={() => setIsFilterModalOpen(true)}
          onProfileClick={handleProfileClick}
          onChatClick={handleFemaleChatClick}
          onSeeAllClick={handleExploreClick}
        />

        {/* Filter Popup Modal */}
        <FilterPanel
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          initialFilters={filterOptions}
        />

        {/* Daily Reward Modal */}
        <DailyRewardModal
          isOpen={isDailyRewardModalOpen}
          onClose={() => setIsDailyRewardModalOpen(false)}
          coinsAwarded={dailyRewardData.amount}
          newBalance={dailyRewardData.newBalance}
        />
      </div>
    </div>
  );
};
