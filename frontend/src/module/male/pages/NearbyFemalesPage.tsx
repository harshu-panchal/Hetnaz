import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import chatService from '../../../core/services/chat.service';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { InsufficientBalanceModal } from '../components/InsufficientBalanceModal';
import { DailyRewardModal } from '../../../shared/components/DailyRewardModal';
import offlineQueueService from '../../../core/services/offlineQueue.service';
import apiClient from '../../../core/api/client';
import { useDiscoveryProfiles } from '../../../core/queries/useDiscoveryQuery';
import { NearbyFemaleItem } from '../components/NearbyFemaleItem';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel, FilterOptions } from '../components/FilterPanel';

import { useTranslation } from '../../../core/hooks/useTranslation';

type FilterType = 'all' | 'online' | 'new' | 'popular';

export const NearbyFemalesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { coinBalance, updateBalance } = useGlobalState();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    ageRange: { min: 18, max: 45 },
    maxDistance: 100
  });

  // React Query Hook
  const {
    data: profiles = [],
    isLoading: isQueryLoading,
    error: queryError
  } = useDiscoveryProfiles(activeFilter);

  // Apply Filters
  const displayProfiles = useMemo(() => {
    const rawData = profiles;
    
    return rawData
      .filter((profile: any) => {
        // 1. Tab Filter
        if (activeFilter === 'online' && !profile.isOnline) return false;
        
        // 2. Search Query (Name or Age)
        if (searchQuery) {
          const s = searchQuery.toLowerCase();
          const matchesName = profile.name.toLowerCase().includes(s);
          const matchesAge = profile.age?.toString() === s;
          if (!matchesName && !matchesAge) return false;
        }

        // 3. Modal Filters (Age & Distance)
        if (profile.age && profile.age > filterOptions.ageRange.max) return false;
        if (profile.age && profile.age < filterOptions.ageRange.min) return false;

        if (profile.distance && typeof profile.distance === 'string') {
          const distValue = parseFloat(profile.distance.replace(/[^\d.]/g, ''));
          if (!isNaN(distValue) && distValue > filterOptions.maxDistance) return false;
        }

        return true;
      })
      .sort((a: any, b: any) => {
        // 4. Tab Sorting
        if (activeFilter === 'popular') return (b.matchesCount || 0) - (a.matchesCount || 0);
        if (activeFilter === 'new') return b.id.localeCompare(a.id); // Simulating newest first
        if (activeFilter === 'all') return (a.isOnline === b.isOnline) ? 0 : (a.isOnline ? -1 : 1); // Online first in recommend
        return 0;
      });
  }, [profiles, activeFilter, searchQuery, filterOptions]);

  const error = queryError ? (queryError as any).message || 'Failed to load profiles' : null;
  const isLoading = isQueryLoading;

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const requiredCoins = 5;

  // Daily Reward Modal
  const [isDailyRewardModalOpen, setIsDailyRewardModalOpen] = useState(false);
  const [dailyRewardData, setDailyRewardData] = useState({ amount: 0, newBalance: 0 });

  // Check and claim daily reward on page load
  useEffect(() => {
    const checkDailyReward = async () => {
      try {
        console.log('[DailyReward] Attempting to claim...');
        const response = await apiClient.post('/rewards/daily/claim');
        console.log('[DailyReward] Response:', response.data);
        const result = response.data.data;
        console.log('[DailyReward] Result:', result);

        if (result.claimed) {
          console.log('[DailyReward] Reward claimed! Amount:', result.amount, 'New Balance:', result.newBalance);
          // Show celebration modal
          setDailyRewardData({
            amount: result.amount,
            newBalance: result.newBalance
          });
          setIsDailyRewardModalOpen(true);
          console.log('[DailyReward] Modal state set to true');
          // Update global balance
          updateBalance(result.newBalance);
        } else {
          console.log('[DailyReward] Not claimed. Reason:', result.reason);
        }
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.log('[DailyReward] Failed to claim:', error);
      }
    };
    checkDailyReward();
  }, []);

  // Process offline queue when back online
  useEffect(() => {
    const processOfflineQueue = async () => {
      await offlineQueueService.processQueue(async (queuedMsg) => {
        try {
          if (queuedMsg.type === 'hi') {
            await chatService.sendHiMessage(queuedMsg.data.profileId);
            return true;
          }
          return false;
        } catch (err) {
          console.error('[QueueProcessor] Failed to send queued Hi:', err);
          return false;
        }
      });
    };

    offlineQueueService.setOnlineCallback(processOfflineQueue);
    if (offlineQueueService.getQueueSize() > 0) {
      processOfflineQueue();
    }
  }, []);

  const handleProfileClick = (profileId: string) => {
    const found = profiles.find((p: any) => (p.id || p._id) === profileId);
    navigate(`/male/profile/${profileId}`, { state: { profile: found } });
  };

  return (
    <div className="font-display text-ink antialiased selection:bg-pink-600 selection:text-white min-h-screen relative lg:pl-60 overflow-hidden bg-background-light">

      {/* Scrollable Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full">
      {/* Search & Filter Header (Sticky) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-3xl border-b border-pink-100/40 shadow-sm pt-1.5">
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
          <SearchBar
            showLogo={false}
            title="Discover"
            onSearch={setSearchQuery}
            onFilterToggle={() => setIsFilterModalOpen(true)}
          />
        </div>

        {/* Tabs / Filters with Smooth Gliding Indicator */}
        <div className="px-2 pb-1 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="relative flex items-center justify-around w-full">
            {/* Smooth Sliding Active Indicator Bar */}
            <div
              className="absolute left-0 bottom-0 h-[3.5px] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex justify-center pointer-events-none z-0"
              style={{
                width: `${100 / 4}%`,
                transform: `translateX(${Math.max(0, ['all', 'online', 'new', 'popular'].indexOf(activeFilter)) * 100}%)`,
              }}
            >
              <div className="w-8 h-[3.5px] bg-cta-gradient rounded-full shadow-xs" />
            </div>

            {[
              { id: 'all', label: t('recommend') },
              { id: 'online', label: t('onlineTab') },
              { id: 'new', label: t('newTab') },
              { id: 'popular', label: t('popularTab') }
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as FilterType)}
                  className={`relative z-10 flex-1 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-300 text-center active:scale-95 ${
                    isActive
                      ? 'text-pink-600'
                      : 'text-muted-light hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-3 space-y-2 pb-24">
        {/* Online Now Stories Strip */}
        {displayProfiles.length > 0 && (
          <div className="mb-3 px-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Active Singles Now
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {displayProfiles.slice(0, 10).map((p: any) => (
                <div
                  key={`story-discover-${p.id}`}
                  onClick={() => handleProfileClick(p.id)}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 shadow-sm">
                    <div className="size-14 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={p.avatar || 'https://via.placeholder.com/100?text=?'}
                        alt={p.name}
                        className="size-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    {p.isOnline && (
                      <div className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 max-w-[62px] truncate text-center leading-tight">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-[1.75rem] p-3 flex items-center gap-4 animate-pulse shadow-sm border border-slate-100"
              >
                <div className="h-[84px] w-[84px] rounded-[1.25rem] bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-3 w-40 bg-slate-200 rounded" />
                </div>
                <div className="w-16 h-10 rounded-[1.25rem] bg-slate-200 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 bg-red-100 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && profiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <h3 className="text-lg font-bold text-ink mb-2">{t('noProfilesFound', { defaultValue: 'No profiles found' })}</h3>
            <p className="text-muted">
              {t('noProfilesFoundDesc', { defaultValue: 'No approved female profiles are available right now. Check back later!' })}
            </p>
          </div>
        )}

        {/* Animated Profile List */}
        {!isLoading && !error && (
          <div key={activeFilter} className="animate-tab-fade-in space-y-2">
            {displayProfiles.map((profile: any) => (
              <NearbyFemaleItem
                key={profile.id}
                profile={profile}
                onProfileClick={handleProfileClick}
                onChatClick={(id) => navigate(`/male/chat/new_${id}`)}
              />
            ))}
          </div>
        )}

        {/* Radar Exploration Card to eliminate blank space */}
        {!isLoading && !error && (
          <div className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-purple-500/10 border border-pink-200/50 dark:border-pink-900/30 flex flex-col items-center text-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
              <span className="text-2xl">📡</span>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Looking For More Nearby?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs leading-relaxed">
                Expand your distance or adjust filters to explore verified singles from surrounding areas.
              </p>
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-pink-500/25 active:scale-95 transition-all"
            >
              Adjust Distance & Filters
            </button>
          </div>
        )}
      </main>

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onBuyCoins={() => navigate('/male/buy-coins')}
        requiredCoins={requiredCoins}
        currentBalance={coinBalance || 0}
        action="perform this action"
      />

      {/* Filter Modal (Bottom Sheet) */}
      <FilterPanel
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialFilters={filterOptions}
        onApply={(filters) => {
          setFilterOptions(filters);
          setIsFilterModalOpen(false);
        }}
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
