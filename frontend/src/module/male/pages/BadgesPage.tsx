import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { BottomNavigation } from '../components/BottomNavigation';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { MaleSidebar } from '../components/MaleSidebar';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { useAuth } from '../../../core/context/AuthContext';
import type { Badge } from '../../../core/types/global';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const BadgesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useMaleNavigation();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Badge data with translation keys
  const badges: Badge[] = useMemo(() => {
    const masterList: Badge[] = [
      // Membership tier badges (earned through coin purchases)
      {
        id: 'silver_member',
        name: t('badgeSilverMember') || 'Silver Member',
        icon: 'star',
        description: t('badgeSilverMemberDesc') || 'Achieved Silver membership through a coin purchase',
        category: 'vip',
        isUnlocked: false,
        rarity: 'rare',
      },
      {
        id: 'gold_member',
        name: t('badgeGoldMember') || 'Gold Member',
        icon: 'workspace_premium',
        description: t('badgeGoldMemberDesc') || 'Achieved Gold membership through a coin purchase',
        category: 'vip',
        isUnlocked: false,
        rarity: 'epic',
      },
      {
        id: 'platinum_member',
        name: t('badgePlatinumMember') || 'Platinum Member',
        icon: 'diamond',
        description: t('badgePlatinumMemberDesc') || 'Achieved the highest Platinum membership',
        category: 'vip',
        isUnlocked: false,
        rarity: 'legendary',
      },
      // Original badges
      {
        id: '1',
        name: t('badgeVipMember'),
        icon: 'workspace_premium',
        description: t('badgeVipMemberDesc'),
        category: 'vip',
        isUnlocked: false,
        rarity: 'legendary',
      },
      {
        id: '2',
        name: t('badgeFirstGift'),
        icon: 'redeem',
        description: t('badgeFirstGiftDesc'),
        category: 'achievement',
        isUnlocked: false,
        rarity: 'common',
      },
      {
        id: '3',
        name: t('badgeChatMaster'),
        icon: 'chat_bubble',
        description: t('badgeChatMasterDesc'),
        category: 'achievement',
        isUnlocked: false,
        rarity: 'rare',
      },
      {
        id: '4',
        name: t('badgeDiamondGiver'),
        icon: 'diamond',
        description: t('badgeDiamondGiverDesc'),
        category: 'achievement',
        isUnlocked: false,
        rarity: 'epic',
      },
      {
        id: '5',
        name: t('badgeEarlyAdopter'),
        icon: 'star',
        description: t('badgeEarlyAdopterDesc'),
        category: 'special',
        isUnlocked: false,
        rarity: 'rare',
      },
      {
        id: '6',
        name: t('badgeValentineSpecial'),
        icon: 'favorite',
        description: t('badgeValentineSpecialDesc'),
        category: 'limited',
        isUnlocked: false,
        rarity: 'legendary',
      },
      {
        id: '7',
        name: t('badgeProfilePerfect'),
        icon: 'check_circle',
        description: t('badgeProfilePerfectDesc'),
        category: 'achievement',
        isUnlocked: false,
        rarity: 'common',
      },
      {
        id: '8',
        name: t('badgeMatchMaker'),
        icon: 'favorite',
        description: t('badgeMatchMakerDesc'),
        category: 'achievement',
        isUnlocked: false,
        rarity: 'epic',
      },
    ];


    // Merge with user's unlocked badges from backend
    return masterList.map(badge => {
      const unlockedInfo = user?.badges?.find(b => b.id === badge.id || b.name === badge.name);
      if (unlockedInfo) {
        return {
          ...badge,
          isUnlocked: true,
          unlockedAt: unlockedInfo.unlockedAt || badge.unlockedAt
        };
      }
      return badge;
    });
  }, [t, user?.badges]);

  const rarityColors = {
    common: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
    rare: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600',
    epic: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600',
    legendary: 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600',
  };

  const categoryLabels: Record<string, string> = {
    all: t('all'),
    vip: t('categoryVip'),
    achievement: t('categoryAchievement'),
    special: t('categorySpecial'),
    limited: t('categoryLimitedEdition'),
  };

  const rarityLabels: Record<string, string> = {
    common: t('rarityCommon'),
    rare: t('rarityRare'),
    epic: t('rarityEpic'),
    legendary: t('rarityLegendary'),
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredBadges = badges.filter((badge) => {
    if (selectedFilter === 'unlocked' && !badge.isUnlocked) return false;
    if (selectedFilter === 'locked' && badge.isUnlocked) return false;
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    return true;
  });

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalCount = badges.length;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      {/* Top Navbar */}
      <MaleTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <MaleSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      {/* Header */}
      <header className="sticky top-[57px] z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
            aria-label="Go back"
          >
            <MaterialSymbol name="arrow_back" size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t('badges')}</h1>
          <div className="size-10" />
        </div>
      </header>

      {/* Progress Summary */}
      <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-primary/10 via-pink-500/10 to-transparent rounded-xl border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-900 dark:text-white">{t('collectionProgress')}</span>
          <span className="text-sm font-bold text-primary">
            {unlockedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mt-4 space-y-3">
        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'unlocked', 'locked'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === filter
                ? 'bg-primary text-slate-900'
                : 'bg-white dark:bg-[#342d18] text-gray-600 dark:text-gray-400'
                }`}
            >
              {filter === 'all' ? t('all') : filter === 'unlocked' ? t('filterUnlocked') : t('filterLocked')}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'vip', 'achievement', 'special', 'limited'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                ? 'bg-primary text-slate-900'
                : 'bg-white dark:bg-[#342d18] text-gray-600 dark:text-gray-400'
                }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="p-4">
        {filteredBadges.length === 0 ? (
          <div className="text-center py-12">
            <MaterialSymbol name="workspace_premium" size={64} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('errorNoBadgesFound')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className={`relative p-4 rounded-xl border-2 transition-all ${badge.isUnlocked
                  ? `${rarityColors[badge.rarity || 'common']} shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60'
                  }`}
              >
                {/* Locked Overlay */}
                {!badge.isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl z-10">
                    <MaterialSymbol name="lock" size={32} className="text-gray-400" />
                  </div>
                )}

                {/* Badge Icon */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`p-4 rounded-full ${badge.isUnlocked
                      ? 'bg-white/50 dark:bg-black/20'
                      : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  >
                    <MaterialSymbol
                      name={badge.icon as any}
                      size={48}
                      className={badge.isUnlocked ? 'text-primary' : 'text-gray-400'}
                    />
                  </div>

                  {/* Badge Info */}
                  <div className="text-center w-full">
                    <h3
                      className={`font-bold text-sm mb-1 ${badge.isUnlocked ? 'text-slate-900 dark:text-white' : 'text-gray-500'
                        }`}
                    >
                      {badge.name}
                    </h3>
                    <p
                      className={`text-xs mb-2 line-clamp-2 min-h-[32px] ${badge.isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'
                        }`}
                    >
                      {badge.description}
                    </p>

                    {/* Category & Rarity */}
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.isUnlocked
                          ? 'bg-white/50 dark:bg-black/20 text-slate-700 dark:text-slate-300'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                          }`}
                      >
                        {categoryLabels[badge.category]}
                      </span>
                      {badge.rarity && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.isUnlocked
                            ? 'bg-white/50 dark:bg-black/20 text-slate-700 dark:text-slate-300'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                            }`}
                        >
                          {rarityLabels[badge.rarity]}
                        </span>
                      )}
                    </div>

                    {/* Unlocked Date */}
                    {badge.isUnlocked && badge.unlockedAt && (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                        {t('unlockedOn', { date: new Date(badge.unlockedAt).toLocaleDateString() })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

