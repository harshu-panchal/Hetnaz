import React, { useState, useMemo } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

import { FilterOptions } from './FilterPanel';

export interface DiscoverFemalesSectionProps {
  profiles: any[];
  isLoading?: boolean;
  onProfileClick: (profileId: string) => void;
  onChatClick: (profileId: string) => void;
  onSeeAllClick: () => void;
  onFilterClick?: () => void;
  filterOptions?: FilterOptions;
}

type TabType = 'recommend' | 'nearby' | 'online';

export const DiscoverFemalesSection: React.FC<DiscoverFemalesSectionProps> = ({
  profiles = [],
  isLoading = false,
  onProfileClick,
  onChatClick,
  onSeeAllClick,
  onFilterClick,
  filterOptions,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('recommend');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter & sort profiles according to active tab, search query, and filterOptions
  const filteredProfiles = useMemo(() => {
    let list = [...profiles];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q)
      );
    }

    // Modal filter options (Age & Distance)
    if (filterOptions) {
      list = list.filter((p) => {
        if (p.age && (p.age < filterOptions.ageRange.min || p.age > filterOptions.ageRange.max)) {
          return false;
        }
        if (p.distance && typeof p.distance === 'string') {
          const distValue = parseFloat(p.distance.replace(/[^\d.]/g, ''));
          if (!isNaN(distValue) && distValue > filterOptions.maxDistance) {
            return false;
          }
        }
        return true;
      });
    }

    // Tab filter/sort
    if (activeTab === 'online') {
      list = list.filter((p) => p.isOnline);
    } else if (activeTab === 'nearby') {
      // Sort nearest first if distance is available
      list = list.sort((a, b) => {
        const distA = parseFloat(String(a.distance || '999').replace(/[^\d.]/g, '')) || 999;
        const distB = parseFloat(String(b.distance || '999').replace(/[^\d.]/g, '')) || 999;
        return distA - distB;
      });
    } else {
      // Recommend: Online first, then with photos
      list = list.sort((a, b) => {
        if (a.isOnline === b.isOnline) return 0;
        return a.isOnline ? -1 : 1;
      });
    }

    return list;
  }, [profiles, activeTab, searchQuery, filterOptions]);

  return (
    <div className="flex flex-col w-full px-4 mb-4">
      {/* 1. Top Tabs Header (matching Image 3) */}
      <div className="flex items-center justify-between pt-1 pb-3">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setActiveTab('recommend')}
            className={`text-xl sm:text-2xl font-black tracking-tight transition-colors ${
              activeTab === 'recommend'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
            }`}
          >
            {t('recommend') || 'Recommend'}
          </button>

          <button
            onClick={() => setActiveTab('nearby')}
            className={`text-xl sm:text-2xl font-black tracking-tight transition-colors ${
              activeTab === 'nearby'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
            }`}
          >
            {t('nearby') || 'Nearby'}
          </button>
        </div>

        {/* Right Action Icons: Compact Search & Filter */}
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="h-9 w-9 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
            aria-label="Search"
          >
            <MaterialSymbol name={isSearchOpen ? "close" : "search"} size={18} className={isSearchOpen ? "text-pink-600" : ""} />
          </button>

          <button
            onClick={onFilterClick || onSeeAllClick}
            className="h-9 w-9 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 group"
            aria-label="Filter"
          >
            <MaterialSymbol name="tune" size={18} className="group-hover:text-pink-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="mb-3">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={t('searchMatches') || 'Search girls by name or city...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:border-pink-500 shadow-sm"
              autoFocus
            />
            <MaterialSymbol
              name="search"
              size={20}
              className="absolute left-3 text-slate-400 pointer-events-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <MaterialSymbol name="close" size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Online Now Stories Reel */}
      {profiles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Active Singles Now
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {profiles.slice(0, 10).map((p) => (
              <div
                key={`reel-${p.id}`}
                onClick={() => onProfileClick(p.id)}
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

      {/* 3. Loading State */}
      {isLoading && profiles.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-[1.75rem] p-3.5 flex items-center gap-3.5 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse"
            >
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="w-20 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && filteredProfiles.length === 0 && (
        <div className="py-12 px-4 text-center bg-white dark:bg-slate-900 rounded-[1.75rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <span className="text-4xl mb-2 block">🔍</span>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {t('noProfilesFound') || 'No profiles found'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {t('tryDifferentSearch') || 'Check back soon for new profiles!'}
          </p>
        </div>
      )}

      {/* 4. Profiles List (matching Image 3 card layout) */}
      <div className="space-y-3">
        {filteredProfiles.slice(0, 15).map((profile) => {
          // Extract secondary / additional photos for thumbnail preview (e.g. Priyanka's card in Image 3)
          const extraPhotos = (profile.photos || profile.profile?.photos || [])
            .map((p: any) => (typeof p === 'string' ? p : p?.url))
            .filter((url: string) => Boolean(url) && url !== profile.avatar)
            .slice(0, 3);

          const vipTier = profile.memberTier || (profile.isVerified ? 'VIP1' : null);

          return (
            <div
              key={profile.id}
              onClick={() => onProfileClick(profile.id)}
              className="bg-white dark:bg-slate-900 rounded-[1.75rem] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md border border-slate-100/90 dark:border-slate-800/80 transition-all duration-200 cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                {/* Left: Avatar with Online indicator */}
                <div className="relative shrink-0">
                  <div className="w-[62px] h-[62px] rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800">
                    <img
                      src={profile.avatar || 'https://via.placeholder.com/100?text=?'}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {profile.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                  )}
                </div>

                {/* Center: Info Column */}
                <div className="flex-1 min-w-0">
                  {/* Name + Verified Check */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-[17px] font-bold text-slate-900 dark:text-white truncate tracking-tight">
                      {profile.name}
                    </h3>
                    {profile.isVerified && (
                      <span className="text-[#ff4081] shrink-0 text-sm">
                        <MaterialSymbol name="verified" size={16} filled />
                      </span>
                    )}
                  </div>

                  {/* Pills row: Gender+Age & VIP */}
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {/* Pink Gender & Age Pill */}
                    {profile.age && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#ff4081]/15 text-[#ff4081] text-[11px] font-black leading-none shrink-0">
                        <span className="text-[11px] font-bold">♀</span>
                        <span>{profile.age}</span>
                      </span>
                    )}

                    {/* VIP Pill */}
                    {vipTier && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-950/40 dark:to-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-black leading-none shrink-0">
                        <span>👑</span>
                        <span>{vipTier.toUpperCase()}</span>
                      </span>
                    )}
                  </div>

                  {/* Distance or Bio line */}
                  <p className="text-[13px] font-medium text-slate-400 dark:text-slate-500 truncate leading-snug">
                    {profile.distance || profile.location || profile.bio || 'Nearby'}
                  </p>
                </div>

                {/* Right: The iconic Wave "👋 Hi" Orange Gradient Button */}
                <div className="shrink-0 pl-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatClick(profile.id);
                    }}
                    className="h-10 px-5 rounded-full bg-gradient-to-r from-[#ff9f00] via-[#ff7800] to-[#ff5e00] hover:brightness-105 active:scale-95 shadow-[0_4px_14px_rgba(255,120,0,0.38)] text-white flex items-center justify-center gap-1.5 transition-all group"
                  >
                    <span className="text-base group-hover:rotate-12 transition-transform">👋</span>
                    <span className="text-[14px] font-black tracking-wide leading-none">
                      Hi
                    </span>
                  </button>
                </div>
              </div>

              {/* Extra Photo Thumbnails Row (if multiple photos exist, like Priyanka's card in Image 3) */}
              {extraPhotos.length > 0 && (
                <div className="mt-3 pl-[76px] flex items-center gap-2 overflow-hidden">
                  {extraPhotos.map((photoUrl: string, idx: number) => (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-xl overflow-hidden shadow-xs border border-slate-100 dark:border-slate-800 bg-slate-100 shrink-0"
                    >
                      <img
                        src={photoUrl}
                        alt={`${profile.name} photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. See All Footer CTA */}
      {filteredProfiles.length > 5 && (
        <button
          onClick={onSeeAllClick}
          className="mt-4 w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs tracking-wider uppercase shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <span>{t('seeAll') || 'See All Girls'}</span>
          <MaterialSymbol name="arrow_forward" size={16} />
        </button>
      )}

      {/* 6. Expanding Radar / Exploration Card to eliminate blank space */}
      {!isLoading && (
        <div className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-purple-500/10 border border-pink-200/50 dark:border-pink-900/30 flex flex-col items-center text-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
            <MaterialSymbol name="radar" size={24} />
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
            onClick={onFilterClick || onSeeAllClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-pink-500/25 active:scale-95 transition-all"
          >
            Adjust Distance & Filters
          </button>
        </div>
      )}
    </div>
  );
};
