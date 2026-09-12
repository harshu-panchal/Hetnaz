import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import configService from '../../../core/services/config.service';

interface LevelPrivilege {
  level: number;
  badgeName: string;
  description: string;
  icon: string;
  badgeColor: string;
  unlockedGraphic: string; // illustration placeholder style
}

export const MyLevelPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'wealth' | 'charm'>('wealth');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [configuredLevels, setConfiguredLevels] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLevelConfig();
  }, []);

  const fetchLevelConfig = async () => {
    try {
      const config = await configService.getConfig();
      if (config && config.maleLevels) {
        setConfiguredLevels(config.maleLevels);
      } else {
        // Fallbacks
        setConfiguredLevels([
          { level: 1, minCoinsSpent: 0, badgeName: 'Novice' },
          { level: 2, minCoinsSpent: 1000, badgeName: 'Explorer' },
          { level: 3, minCoinsSpent: 3000, badgeName: 'Chaser' },
          { level: 4, minCoinsSpent: 6000, badgeName: 'Vanguard' },
          { level: 5, minCoinsSpent: 10000, badgeName: 'Elite' },
          { level: 6, minCoinsSpent: 20000, badgeName: 'Titan' }
        ]);
      }
    } catch (err) {
      console.error('Failed to load level config:', err);
    }
  };

  const levelInfo = user?.levelInfo || {
    level: 0,
    badgeName: 'Novice',
    totalCoinsSpent: 0,
    nextLevelThreshold: 750,
    progressPercent: 0,
    coinsNeeded: 750,
    nextLevel: 1
  };

  // Pre-configured list of cool privilege illustrations and descriptions matching the level milestones
  const privilegeDefinitions: Record<number, Partial<LevelPrivilege>> = {
    1: {
      description: 'Unlock Wealth level label & priority display in listing rooms.',
      icon: 'badge',
      badgeColor: 'bg-blue-50 text-blue-600 border-blue-200',
      unlockedGraphic: '🏷️'
    },
    2: {
      description: 'Unlock level 2 status badge and Explorer profile badge.',
      icon: 'explore',
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      unlockedGraphic: '🧭'
    },
    3: {
      description: 'Unlock level 3 status badge and Chaser premium ranking status.',
      icon: 'stars',
      badgeColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      unlockedGraphic: '💫'
    },
    4: {
      description: 'Unlock exclusive level gifts catalog in matching rooms.',
      icon: 'redeem',
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-200',
      unlockedGraphic: '⭐'
    },
    5: {
      description: 'Get entry effect animation notification when joining chat rooms.',
      icon: 'bolt',
      badgeColor: 'bg-purple-50 text-purple-600 border-purple-200',
      unlockedGraphic: '⚡'
    },
    6: {
      description: 'Get exclusive skeuomorphic golden profile frame & VIP support.',
      icon: 'workspace_premium',
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200',
      unlockedGraphic: '👑'
    }
  };

  // Compile list of level milestones
  const levelMilestones: LevelPrivilege[] = configuredLevels.map(lvl => {
    const customDef = privilegeDefinitions[lvl.level] || {
      description: `Unlock level ${lvl.level} status badge and corresponding perks.`,
      icon: 'military_tech',
      badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      unlockedGraphic: '🔮'
    };
    return {
      level: lvl.level,
      badgeName: lvl.badgeName,
      description: customDef.description!,
      icon: customDef.icon!,
      badgeColor: customDef.badgeColor!,
      unlockedGraphic: customDef.unlockedGraphic!
    };
  });

  const unlockedCount = levelMilestones.filter(m => levelInfo.level >= m.level).length;
  const totalCount = levelMilestones.length;

  return (
    <div className="text-ink font-display antialiased min-h-screen relative overflow-x-hidden pb-24 bg-background-light">
      <div className="relative z-10 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full flex flex-col px-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between py-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white shadow-card active:scale-95 transition-all"
          >
            <MaterialSymbol name="arrow_back_ios_new" size={18} className="text-ink" />
          </button>

          <h1 className="text-sm font-black uppercase tracking-[0.25em] text-ink">
            My Level
          </h1>

          <button
            onClick={() => setShowHelpModal(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white shadow-card active:scale-95 transition-all"
          >
            <MaterialSymbol name="help" size={20} className="text-ink" />
          </button>
        </div>

        {/* Level Navigation Tabs */}
        <div className="flex p-1.5 bg-[#f6ece7] rounded-[1.75rem] gap-1 mb-8">
          <button
            onClick={() => setActiveTab('wealth')}
            className={`flex-1 py-3.5 rounded-[1.25rem] text-xs font-black transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-1.5 ${
              activeTab === 'wealth'
                ? 'bg-white text-pink-600 shadow-card scale-[1.01]'
                : 'text-muted-light hover:text-pink-500'
            }`}
          >
            <MaterialSymbol name="monetization_on" size={16} filled={activeTab === 'wealth'} />
            Wealth Level
          </button>
          <button
            onClick={() => setActiveTab('charm')}
            className={`flex-1 py-3.5 rounded-[1.25rem] text-xs font-black transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-1.5 ${
              activeTab === 'charm'
                ? 'bg-white text-pink-600 shadow-card scale-[1.01]'
                : 'text-muted-light hover:text-pink-500'
            }`}
          >
            <MaterialSymbol name="favorite" size={16} filled={activeTab === 'charm'} />
            Charm Level
          </button>
        </div>

        {activeTab === 'charm' ? (
          /* Charm Level (Female-only stats shown as info screen) */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white shadow-card rounded-[2.5rem]">
            <div className="size-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
              <MaterialSymbol name="favorite" size={38} className="text-rose-500" filled />
            </div>
            <h3 className="text-base font-black uppercase tracking-wider mb-2 text-ink">Charm Levels</h3>
            <p className="text-xs text-muted font-medium leading-relaxed max-w-xs mb-6">
              Charm Levels represent popularity and are earned by receiving gifts. This level system is active for female profiles. Start chats & receive gifts to rise on the charm scale!
            </p>
            <button
              onClick={() => setActiveTab('wealth')}
              className="px-6 py-2.5 rounded-xl bg-pink-50 text-pink-600 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-pink-100 active:scale-95"
            >
              Back to Wealth Level
            </button>
          </div>
        ) : (
          /* Wealth Level (Main active page) */
          <>
            {/* Center Avatar & Chevron Wings Visual */}
            <div className="flex flex-col items-center mb-8 relative pt-6">
              {/* Chevron Wings Visual */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full max-w-[280px] flex justify-between px-2 text-pink-200">
                  <div className="text-[52px] leading-none select-none animate-pulse">
                    《
                  </div>
                  <div className="text-[52px] leading-none select-none animate-pulse" style={{ animationDelay: '1s' }}>
                    》
                  </div>
                </div>
              </div>

              {/* Glowing Circle Avatar */}
              <div className="relative group">
                {/* Aura Glow */}
                <div className="absolute -inset-1.5 bg-cta-gradient rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
                <div className="p-1.5 rounded-full bg-white relative z-10 shadow-card-lg">
                  <div
                    className="bg-center bg-no-repeat bg-cover rounded-full h-28 w-28"
                    style={{ backgroundImage: `url("${user?.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}")` }}
                  />
                </div>

                {/* Emblem Badge displaying level */}
                <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 px-5 py-1.5 rounded-full bg-cta-gradient flex items-center gap-1.5 shadow-cta">
                  <MaterialSymbol name="military_tech" size={14} className="text-white" filled />
                  <span className="text-[11px] font-black tracking-widest text-white">
                    {levelInfo.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar & Description */}
            <div className="flex flex-col items-center mb-10 w-full mt-4">
              {/* Level limits display */}
              <div className="flex justify-between items-center w-full px-1 mb-2 text-[10px] font-bold text-muted-light uppercase tracking-widest">
                <span>Lv.{levelInfo.level}</span>
                <span>Lv.{levelInfo.nextLevel !== null ? levelInfo.nextLevel : levelInfo.level}</span>
              </div>

              {/* Progress Slider */}
              <div className="w-full h-2.5 bg-pink-50 rounded-full p-[2px] overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-cta-gradient transition-all duration-1000"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>

              {/* Wealth Points description */}
              <span className="text-xs font-black uppercase tracking-[0.15em] text-pink-600">
                Wealth Points: {levelInfo.totalCoinsSpent.toLocaleString()} / {levelInfo.nextLevelThreshold !== null ? levelInfo.nextLevelThreshold.toLocaleString() : 'MAX'}
              </span>
            </div>

            {/* Privileges Title */}
            <div className="mb-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink">
                Upgrade to unlock privileges ({unlockedCount}/{totalCount})
              </h2>
            </div>

            {/* Vertical timeline items */}
            <div className="relative pl-8 border-l border-dashed border-pink-200 space-y-5 ml-3 pb-8">
              {levelMilestones.map((milestone) => {
                const isUnlocked = levelInfo.level >= milestone.level;
                
                return (
                  <div key={milestone.level} className="relative">
                    {/* Circle timeline dot on the left line */}
                    <div className={`absolute -left-[41px] top-4 size-6 rounded-full flex items-center justify-center z-10 ${
                      isUnlocked
                        ? 'bg-cta-gradient text-white shadow-cta'
                        : 'bg-white text-muted-light shadow-card'
                    }`}>
                      <MaterialSymbol name={isUnlocked ? 'check' : 'lock'} size={12} filled={isUnlocked} />
                    </div>

                    {/* Privilege Content Card */}
                    <div className={`p-5 rounded-[2rem] transition-all duration-300 flex items-center justify-between gap-4 relative overflow-hidden ${
                      isUnlocked
                        ? 'bg-white shadow-card'
                        : 'bg-[#f6ece7] opacity-70'
                    }`}>
                      {/* Info details */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-ink' : 'text-muted-light'}`}>
                            Wealth Level {milestone.level}
                          </h3>
                          {isUnlocked && (
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border leading-none ${milestone.badgeColor}`}>
                              {milestone.badgeName}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] leading-relaxed font-medium ${isUnlocked ? 'text-muted' : 'text-muted-light'}`}>
                          {milestone.description}
                        </p>
                      </div>

                      {/* Visual graphic illustration on the right */}
                      <div className={`size-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl relative ${
                        isUnlocked
                          ? 'bg-pink-50 text-pink-600'
                          : 'bg-white text-muted-light'
                      }`}>
                        <span>{milestone.unlockedGraphic}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Help Instructions Dialog Modal */}
      {showHelpModal && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 animate-in fade-in duration-300"
            onClick={() => setShowHelpModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-[2.5rem] shadow-card-lg max-w-xs w-full p-6 pointer-events-auto text-center relative overflow-hidden animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="size-14 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MaterialSymbol name="info" size={28} className="text-pink-600" />
              </div>

              <h3 className="text-sm font-black uppercase tracking-wider text-ink mb-3">Level Rules</h3>

              <div className="space-y-4 text-left text-[11px] font-medium text-muted leading-relaxed mb-6">
                <div>
                  <h4 className="font-bold text-ink mb-0.5">💎 Wealth Points</h4>
                  <p>1 coin spent in the application converts to exactly 1 Wealth Point. The more you spend, the higher your Wealth level rises.</p>
                </div>
                <div>
                  <h4 className="font-bold text-ink mb-0.5">🚀 Level Perks</h4>
                  <p>Unlocking new levels grants you exclusive profile badges, chat room enter announcements, entry animations, avatar frames, and more.</p>
                </div>
                <div>
                  <h4 className="font-bold text-ink mb-0.5">🏆 Badge Vault</h4>
                  <p>Once unlocked, your level status badge is immediately enabled and displayed in your badge catalog as well as other profiles.</p>
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-3 rounded-xl bg-cta-gradient text-xs font-black uppercase tracking-widest active:scale-95 transition-all text-white shadow-cta"
              >
                Got It
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
