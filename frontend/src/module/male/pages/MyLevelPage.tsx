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
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      unlockedGraphic: '🏷️'
    },
    2: {
      description: 'Unlock level 2 status badge and Explorer profile badge.',
      icon: 'explore',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      unlockedGraphic: '🧭'
    },
    3: {
      description: 'Unlock level 3 status badge and Chaser premium ranking status.',
      icon: 'stars',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      unlockedGraphic: '💫'
    },
    4: {
      description: 'Unlock exclusive level gifts catalog in matching rooms.',
      icon: 'redeem',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      unlockedGraphic: '⭐'
    },
    5: {
      description: 'Get entry effect animation notification when joining chat rooms.',
      icon: 'bolt',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      unlockedGraphic: '⚡'
    },
    6: {
      description: 'Get exclusive skeuomorphic golden profile frame & VIP support.',
      icon: 'workspace_premium',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      unlockedGraphic: '👑'
    }
  };

  // Compile list of level milestones
  const levelMilestones: LevelPrivilege[] = configuredLevels.map(lvl => {
    const customDef = privilegeDefinitions[lvl.level] || {
      description: `Unlock level ${lvl.level} status badge and corresponding perks.`,
      icon: 'military_tech',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
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
    <div className="text-white font-display antialiased min-h-screen relative overflow-x-hidden pb-24 bg-[#050614]">
      {/* Dynamic Deep Stellar Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e1130] via-[#050614] to-[#02030a] z-0" />
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-[#4f46e5]/10 blur-[150px] rounded-full z-0" />

      <div className="relative z-10 max-w-md mx-auto w-full flex flex-col px-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between py-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 active:scale-95 transition-all"
          >
            <MaterialSymbol name="arrow_back_ios_new" size={18} className="text-white" />
          </button>
          
          <h1 className="text-sm font-black uppercase tracking-[0.25em] text-white">
            My Level
          </h1>

          <button
            onClick={() => setShowHelpModal(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 active:scale-95 transition-all"
          >
            <MaterialSymbol name="help" size={20} className="text-white" />
          </button>
        </div>

        {/* Level Navigation Tabs */}
        <div className="flex p-1.5 bg-black/40 backdrop-blur-md rounded-[1.75rem] border border-white/5 gap-1 mb-8 shadow-inner">
          <button
            onClick={() => setActiveTab('wealth')}
            className={`flex-1 py-3.5 rounded-[1.25rem] text-xs font-black transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-1.5 ${
              activeTab === 'wealth'
                ? 'bg-white text-[#050614] shadow-lg scale-[1.01]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MaterialSymbol name="monetization_on" size={16} filled={activeTab === 'wealth'} />
            Wealth Level
          </button>
          <button
            onClick={() => setActiveTab('charm')}
            className={`flex-1 py-3.5 rounded-[1.25rem] text-xs font-black transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-1.5 ${
              activeTab === 'charm'
                ? 'bg-white text-[#050614] shadow-lg scale-[1.01]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MaterialSymbol name="favorite" size={16} filled={activeTab === 'charm'} />
            Charm Level
          </button>
        </div>

        {activeTab === 'charm' ? (
          /* Charm Level (Female-only stats shown as info screen) */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] shadow-2xl">
            <div className="size-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 animate-pulse">
              <MaterialSymbol name="favorite" size={38} className="text-rose-500" filled />
            </div>
            <h3 className="text-base font-black uppercase tracking-wider mb-2">Charm Levels</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mb-6">
              Charm Levels represent popularity and are earned by receiving gifts. This level system is active for female profiles. Start chats & receive gifts to rise on the charm scale!
            </p>
            <button
              onClick={() => setActiveTab('wealth')}
              className="px-6 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/20 active:scale-95"
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
                <div className="w-full max-w-[280px] flex justify-between px-2 text-blue-400/40">
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
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-60 group-hover:opacity-85 transition-opacity duration-500 animate-pulse" />
                <div className="p-1.5 rounded-full bg-[#050614] relative z-10 border-2 border-blue-500/40">
                  <div
                    className="bg-center bg-no-repeat bg-cover rounded-full h-28 w-28 border border-white/20 shadow-2xl"
                    style={{ backgroundImage: `url("${user?.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}")` }}
                  />
                </div>
                
                {/* Emblem Badge displaying level */}
                <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 px-5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
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
              <div className="flex justify-between items-center w-full px-1 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Lv.{levelInfo.level}</span>
                <span>Lv.{levelInfo.nextLevel !== null ? levelInfo.nextLevel : levelInfo.level}</span>
              </div>

              {/* Progress Slider */}
              <div className="w-full h-2.5 bg-black/50 border border-white/5 rounded-full p-[2px] shadow-inner overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 shadow-[0_0_12px_rgba(79,70,229,0.6)] transition-all duration-1000"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>

              {/* Wealth Points description */}
              <span className="text-xs font-black uppercase tracking-[0.15em] text-blue-400">
                Wealth Points: {levelInfo.totalCoinsSpent.toLocaleString()} / {levelInfo.nextLevelThreshold !== null ? levelInfo.nextLevelThreshold.toLocaleString() : 'MAX'}
              </span>
            </div>

            {/* Privileges Title */}
            <div className="mb-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">
                Upgrade to unlock privileges ({unlockedCount}/{totalCount})
              </h2>
            </div>

            {/* Vertical timeline items */}
            <div className="relative pl-8 border-l border-dashed border-white/10 space-y-5 ml-3 pb-8">
              {levelMilestones.map((milestone) => {
                const isUnlocked = levelInfo.level >= milestone.level;
                
                return (
                  <div key={milestone.level} className="relative">
                    {/* Circle timeline dot on the left line */}
                    <div className={`absolute -left-[41px] top-4 size-6 rounded-full flex items-center justify-center border z-10 shadow-lg ${
                      isUnlocked
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-[#050614] border-white/10 text-slate-500'
                    }`}>
                      <MaterialSymbol name={isUnlocked ? 'check' : 'lock'} size={12} filled={isUnlocked} />
                    </div>

                    {/* Privilege Content Card */}
                    <div className={`p-5 rounded-[2rem] border transition-all duration-300 flex items-center justify-between gap-4 relative overflow-hidden ${
                      isUnlocked
                        ? 'bg-white/5 border-white/10 backdrop-blur-md'
                        : 'bg-[#08091a]/40 border-white/5 opacity-60'
                    }`}>
                      {/* Inner blur aura */}
                      {isUnlocked && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl -mr-12 -mt-12" />
                      )}

                      {/* Info details */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                            Wealth Level {milestone.level}
                          </h3>
                          {isUnlocked && (
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border leading-none ${milestone.badgeColor}`}>
                              {milestone.badgeName}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] leading-relaxed font-medium ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                          {milestone.description}
                        </p>
                      </div>

                      {/* Visual graphic illustration on the right */}
                      <div className={`size-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl relative border shadow-lg ${
                        isUnlocked
                          ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                          : 'bg-white/5 border-white/5 text-slate-600'
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
              className="bg-[#0b0c20]/95 border border-white/10 rounded-[2.5rem] shadow-2xl max-w-xs w-full p-6 pointer-events-auto text-center relative overflow-hidden animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
              
              <div className="size-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MaterialSymbol name="info" size={28} className="text-blue-400" />
              </div>

              <h3 className="text-sm font-black uppercase tracking-wider text-white mb-3">Level Rules</h3>
              
              <div className="space-y-4 text-left text-[11px] font-medium text-slate-400 leading-relaxed mb-6">
                <div>
                  <h4 className="font-bold text-slate-200 mb-0.5">💎 Wealth Points</h4>
                  <p>1 coin spent in the application converts to exactly 1 Wealth Point. The more you spend, the higher your Wealth level rises.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 mb-0.5">🚀 Level Perks</h4>
                  <p>Unlocking new levels grants you exclusive profile badges, chat room enter announcements, entry animations, avatar frames, and more.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 mb-0.5">🏆 Badge Vault</h4>
                  <p>Once unlocked, your level status badge is immediately enabled and displayed in your badge catalog as well as other profiles.</p>
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 text-xs font-black uppercase tracking-widest active:scale-95 transition-all text-white shadow-lg shadow-blue-500/20"
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
