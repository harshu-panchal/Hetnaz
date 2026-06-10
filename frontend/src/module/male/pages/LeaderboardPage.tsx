import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { MeshBackground } from '../../../shared/components/auth/AuthLayoutComponents';
import userService from '../../../core/services/user.service';

interface Ranker {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  level: number;
  badgeName: string;
  totalCoinsSpent: number;
}

export const LeaderboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rankings, setRankings] = useState<Ranker[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getLeaderboard();
      if (data) {
        setRankings(data.rankings || []);
        setMyRank(data.myRank || null);
      }
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load level comparisons.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRankings = rankings.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split top 3 from the rest
  const top1 = rankings.find(r => r.rank === 1);
  const top2 = rankings.find(r => r.rank === 2);
  const top3 = rankings.find(r => r.rank === 3);
  const remaining = filteredRankings.filter(r => r.rank > 3);

  return (
    <div className="text-slate-900 dark:text-white font-display antialiased min-h-screen relative overflow-x-hidden pb-32">
      <MeshBackground />

      <div className="relative z-10 max-w-md mx-auto w-full flex flex-col px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <button
            onClick={() => navigate(-1)}
            className="skeuo-button w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-black/20 border-white/60 dark:border-white/5"
          >
            <MaterialSymbol name="arrow_back_ios_new" size={18} className="text-primary" />
          </button>
          <h1 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">
            {t('leaderboardTitle') || 'Leaderboard'}
          </h1>
          <button
            onClick={fetchData}
            className="skeuo-button w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-black/20 border-white/60 dark:border-white/5"
          >
            <MaterialSymbol name="refresh" size={20} className="text-primary" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search user by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-6 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/60 dark:border-white/5 text-xs font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white shadow-sm"
            />
            <MaterialSymbol
              name="search"
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Comparisons...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <MaterialSymbol name="error" size={48} className="text-red-500 mb-4" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Podium (Top 3) */}
            {!searchQuery && rankings.length > 0 && (
              <div className="flex items-end justify-center gap-4 mb-8 pt-4">
                {/* 2nd Place */}
                {top2 && (
                  <div className="flex-1 flex flex-col items-center">
                    <div className="relative group active:scale-95 transition-transform">
                      <div className="absolute inset-0 bg-slate-400/20 blur-xl rounded-full" />
                      <div className="p-[3px] rounded-full bg-gradient-to-b from-slate-300 to-slate-400 relative z-10 shadow-lg">
                        <img
                          src={top2.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                          alt={top2.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 skeuo-button px-2.5 h-6 rounded-full flex items-center justify-center bg-slate-400 text-slate-900 border-white/60 dark:border-white/5 z-20 text-[10px] font-black shadow-md">
                        2
                      </div>
                    </div>
                    <div className="text-center mt-4 max-w-[90px]">
                      <p className="text-[11px] font-black truncate leading-tight">{top2.name}</p>
                      <p className="text-[8px] font-black uppercase tracking-wide text-slate-400 mt-0.5">Lvl {top2.level}</p>
                      <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-white/10 px-2 py-0.5 rounded-full mt-1.5 inline-block whitespace-nowrap">
                        {top2.totalCoinsSpent.toLocaleString()} coins
                      </span>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {top1 && (
                  <div className="flex-1 flex flex-col items-center -translate-y-4">
                    <div className="relative group active:scale-95 transition-transform">
                      <div className="absolute inset-0 bg-amber-500/30 blur-2xl rounded-full" />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                        <MaterialSymbol name="workspace_premium" size={28} filled />
                      </div>
                      <div className="p-[4px] rounded-full bg-gradient-to-b from-amber-400 via-amber-300 to-yellow-500 relative z-10 shadow-xl border border-white/40">
                        <img
                          src={top1.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                          alt={top1.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 skeuo-button px-3 h-7 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-white/60 dark:border-white/5 z-20 text-xs font-black shadow-md">
                        1
                      </div>
                    </div>
                    <div className="text-center mt-4 max-w-[100px]">
                      <p className="text-xs font-black truncate leading-tight">{top1.name}</p>
                      <p className="text-[9px] font-black uppercase tracking-wide text-amber-500 mt-0.5">Lvl {top1.level}</p>
                      <span className="text-[10px] font-black text-amber-950 bg-amber-400 border border-amber-300 px-2.5 py-0.5 rounded-full mt-1.5 inline-block whitespace-nowrap shadow-lg shadow-amber-500/20">
                        {top1.totalCoinsSpent.toLocaleString()} coins
                      </span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {top3 && (
                  <div className="flex-1 flex flex-col items-center">
                    <div className="relative group active:scale-95 transition-transform">
                      <div className="absolute inset-0 bg-amber-700/20 blur-xl rounded-full" />
                      <div className="p-[3px] rounded-full bg-gradient-to-b from-amber-600 to-amber-800 relative z-10 shadow-lg">
                        <img
                          src={top3.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                          alt={top3.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 skeuo-button px-2.5 h-6 rounded-full flex items-center justify-center bg-amber-700 text-amber-100 border-white/60 dark:border-white/5 z-20 text-[10px] font-black shadow-md">
                        3
                      </div>
                    </div>
                    <div className="text-center mt-4 max-w-[90px]">
                      <p className="text-[11px] font-black truncate leading-tight">{top3.name}</p>
                      <p className="text-[8px] font-black uppercase tracking-wide text-slate-400 mt-0.5">Lvl {top3.level}</p>
                      <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-white/10 px-2 py-0.5 rounded-full mt-1.5 inline-block whitespace-nowrap">
                        {top3.totalCoinsSpent.toLocaleString()} coins
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rest of the rankings */}
            <div className="space-y-3">
              {remaining.length > 0 ? (
                remaining.map((ranker) => {
                  const isMe = ranker.userId === user?.id;
                  return (
                    <div
                      key={ranker.userId}
                      className={`skeuo-card rounded-[1.75rem] p-4 flex items-center justify-between border-white/60 dark:border-white/5 transition-all duration-300 bg-mesh-glass ${isMe ? 'shadow-xl scale-[1.02] bg-violet-500/10 border-violet-500/30' : ''}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Rank Badge */}
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-black/30 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                          #{ranker.rank}
                        </div>
                        {/* Avatar */}
                        <img
                          src={ranker.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                          alt={ranker.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/20"
                        />
                        {/* User name and level info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {ranker.name}
                            </span>
                            {isMe && (
                              <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-[8px] font-black uppercase tracking-wider text-primary">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                            Level {ranker.level} • {ranker.badgeName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <span className="text-xs font-black text-slate-800 dark:text-white">
                          {ranker.totalCoinsSpent.toLocaleString()}
                        </span>
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          spent
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white/40 dark:bg-black/20 rounded-[2rem] border border-white/60 dark:border-white/5">
                  <MaterialSymbol name="search_off" size={48} className="text-slate-400 mx-auto mb-3" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No users found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Pinned Rank Card */}
      {user?.role === 'male' && user.levelInfo && myRank !== null && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#fffcfd]/90 to-transparent dark:from-[#0a0a0a]/90 backdrop-blur-md z-40">
          <div className="max-w-md mx-auto w-full skeuo-card rounded-[2rem] bg-violet-600 dark:bg-violet-950 text-white p-4 flex items-center justify-between border-violet-500/20 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="flex items-center gap-4 min-w-0 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex flex-col items-center justify-center shrink-0 border border-white/20">
                <span className="text-[8px] font-black uppercase tracking-widest text-violet-200">Rank</span>
                <span className="text-sm font-black leading-none mt-0.5">#{myRank}</span>
              </div>
              <img
                src={user.avatarUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white/20"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black truncate">{user.name}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[8px] font-black uppercase tracking-wider">
                    Me
                  </span>
                </div>
                <p className="text-[9px] font-bold text-violet-200 uppercase tracking-widest mt-0.5">
                  Lvl {user.levelInfo.level} • {user.levelInfo.badgeName}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 pl-2 relative z-10">
              <span className="text-sm font-black">
                {user.levelInfo.totalCoinsSpent.toLocaleString()}
              </span>
              <p className="text-[8px] font-bold text-violet-200 uppercase tracking-widest">
                coins spent
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
