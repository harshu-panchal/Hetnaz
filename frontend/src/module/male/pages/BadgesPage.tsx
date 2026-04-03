import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { BottomNavigation } from '../components/BottomNavigation';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { useAuth } from '../../../core/context/AuthContext';
import type { Badge } from '../../../core/types/global';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const BadgesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Badge data with translation keys
  const badges: Badge[] = useMemo(() => {
    const masterList: Badge[] = [
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

  const rarityGradients = {
    common: 'from-slate-400/20 to-slate-500/20',
    rare: 'from-blue-400/20 to-indigo-500/20',
    epic: 'from-purple-400/20 to-pink-500/20',
    legendary: 'from-amber-300/20 to-orange-500/20',
  };

  const rarityText = {
    common: 'text-slate-500 dark:text-slate-400',
    rare: 'text-blue-500 dark:text-blue-400',
    epic: 'text-purple-500 dark:text-purple-400',
    legendary: 'text-amber-500 dark:text-amber-400 text-glow-gold',
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
    <div className="bg-[#fff8fb] dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-24 min-h-screen relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="skeuo-button size-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            aria-label="Go back"
          >
            <MaterialSymbol name="arrow_back_ios_new" size={20} className="text-slate-600 dark:text-white" />
          </button>
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">{t('badges')}</h1>
          <div className="size-10" />
        </div>
      </header>

      <div className="max-w-md mx-auto w-full flex flex-col relative z-10">
        {/* Progress Summary Card */}
        <div className="mx-4 mt-6 p-6 skeuo-card rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-500" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{t('collectionProgress')}</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {Math.round((unlockedCount / totalCount) * 100)}% <span className="text-xs text-slate-400 font-bold uppercase ml-1">Unlocked</span>
              </h2>
            </div>
            <div className="size-14 skeuo-inset rounded-2xl flex items-center justify-center">
              <MaterialSymbol name="military_tech" size={32} className="text-primary drop-shadow-[0_4px_8px_rgba(255,77,109,0.3)]" />
            </div>
          </div>
          
          <div className="w-full h-3 skeuo-inset rounded-full p-1">
            <div
              className="bg-gradient-to-r from-primary via-pink-500 to-rose-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,77,109,0.4)]"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 px-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{unlockedCount} Earned</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{totalCount - unlockedCount} Remaining</span>
          </div>
        </div>

        {/* Filters Container */}
        <div className="px-4 mt-8 space-y-4">
          {/* Status Segmented Control */}
          <div className="flex p-1.5 skeuo-inset rounded-2xl gap-1">
            {(['all', 'unlocked', 'locked'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider ${selectedFilter === filter
                  ? 'bg-white dark:bg-[#4b202e] text-primary shadow-sm scale-[1.02]'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {filter === 'all' ? t('all') : filter === 'unlocked' ? t('filterUnlocked') : t('filterLocked')}
              </button>
            ))}
          </div>

          {/* Category Scroller */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'vip', 'achievement', 'special', 'limited'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all duration-300 capitalize tracking-wide border ${selectedCategory === category
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                  : 'bg-white/50 dark:bg-white/5 border-white/40 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-primary/30'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="px-4 py-6">
          {filteredBadges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 skeuo-card rounded-[2.5rem] opacity-50">
              <div className="size-20 skeuo-inset rounded-full flex items-center justify-center mb-4">
                <MaterialSymbol name="workspace_premium" size={40} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('errorNoBadgesFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {filteredBadges.map((badge) => {
                const glowClass = badge.rarity === 'legendary' ? 'animate-gold-halo' : badge.rarity === 'epic' ? 'animate-badge-glow' : '';
                
                return (
                  <div
                    key={badge.id}
                    className={`relative flex flex-col p-5 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] ${
                      badge.isUnlocked 
                        ? `skeuo-card bg-mesh-glass ${glowClass}` 
                        : 'bg-slate-100/50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 grayscale opacity-80'
                    }`}
                  >
                    {/* Locked Overlay */}
                    {!badge.isUnlocked && (
                      <div className="absolute inset-0 z-20 backdrop-blur-[2px] rounded-[2rem] flex items-center justify-center">
                         <div className="size-12 rounded-2xl skeuo-card flex items-center justify-center bg-white/80 dark:bg-black/60 shadow-xl">
                            <MaterialSymbol name="lock" size={24} className="text-slate-400" />
                         </div>
                      </div>
                    )}

                    {/* Badge UI */}
                    <div className="flex flex-col items-center">
                      {/* Icon Container */}
                      <div className={`relative mb-5 transform transition-transform group-hover:rotate-12 duration-500`}>
                        <div className={`size-20 rounded-2xl skeuo-inset border border-white/60 dark:border-white/10 flex items-center justify-center relative z-10 overflow-hidden`}>
                           {/* Background Glow */}
                           <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${badge.isUnlocked ? rarityGradients[badge.rarity || 'common'] : 'from-slate-200 to-slate-300 opacity-20'}`} />
                           
                           <MaterialSymbol
                              name={badge.icon as any}
                              size={40}
                              filled={badge.isUnlocked}
                              className={`relative z-20 ${badge.isUnlocked ? rarityText[badge.rarity || 'common'] : 'text-slate-300 dark:text-slate-600'}`}
                           />
                        </div>
                        {/* Decorative shadow */}
                        {badge.isUnlocked && <div className="absolute -bottom-2 inset-x-4 h-4 bg-black/5 dark:bg-white/5 blur-md rounded-full -z-10" />}
                      </div>

                      {/* Badge Details */}
                      <div className="text-center space-y-2">
                        <h3 className={`font-black text-xs uppercase tracking-tight leading-tight line-clamp-1 ${badge.isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                          {badge.name}
                        </h3>
                        
                        <p className={`text-[9px] font-bold leading-relaxed line-clamp-2 min-h-[22px] ${badge.isUnlocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600'}`}>
                          {badge.description}
                        </p>

                        <div className="flex items-center justify-center gap-1.5 pt-1">
                          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm border ${
                            badge.isUnlocked 
                              ? 'bg-white/60 dark:bg-white/10 border-white/20 text-slate-600 dark:text-slate-300' 
                              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5 text-slate-400'
                          }`}>
                            {categoryLabels[badge.category]}
                          </div>
                          {badge.rarity && (
                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm border ${
                              badge.isUnlocked 
                                ? `bg-white/60 dark:bg-white/10 border-white/20 ${rarityText[badge.rarity]}` 
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5 text-slate-400'
                            }`}>
                              {rarityLabels[badge.rarity]}
                            </div>
                          )}
                        </div>

                        {badge.isUnlocked && badge.unlockedAt && (
                          <div className="mt-3 flex items-center justify-center gap-1 text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                            <MaterialSymbol name="event_available" size={10} />
                            {new Date(badge.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};
