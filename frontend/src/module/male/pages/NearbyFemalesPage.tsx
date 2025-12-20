import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import userService, { DiscoverProfile } from '../../../core/services/user.service';
import chatService from '../../../core/services/chat.service';

type FilterType = 'all' | 'nearby' | 'new' | 'popular';

export const NearbyFemalesPage = () => {
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingHiTo, setSendingHiTo] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Map filter to API parameter
      let apiFilter = 'all';
      if (activeFilter === 'nearby') apiFilter = 'online'; // Use online as proxy for nearby
      else if (activeFilter === 'new') apiFilter = 'new';
      else if (activeFilter === 'popular') apiFilter = 'popular';

      const data = await userService.discoverFemales(apiFilter);
      setProfiles(data.profiles || []);
    } catch (err: any) {
      console.error('Failed to fetch profiles:', err);
      setError(err.response?.data?.message || 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSendHi = async (profileId: string) => {
    try {
      setSendingHiTo(profileId);
      const result = await chatService.sendHiMessage(profileId);
      // Navigate to the chat
      navigate(`/male/chat/${result.chatId}`);
    } catch (err: any) {
      console.error('Failed to send Hi:', err);
      alert(err.response?.data?.message || 'Failed to send Hi message');
    } finally {
      setSendingHiTo(null);
    }
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/male/profile/${profileId}`);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white flex flex-col min-h-screen">
      {/* Tabs / Filters */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-pink-50/95 via-rose-50/95 to-pink-50/95 dark:from-[#1a0f14]/95 dark:via-[#2d1a24]/95 dark:to-[#1a0f14]/95 backdrop-blur-md border-b border-pink-200/40 dark:border-pink-900/30 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[13px] font-semibold">
            <button
              className={`pb-1 ${activeFilter === 'all' ? 'text-slate-900 dark:text-white border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setActiveFilter('all')}
            >
              Recommend
            </button>
            <button
              className={`pb-1 ${activeFilter === 'nearby' ? 'text-slate-900 dark:text-white border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setActiveFilter('nearby')}
            >
              Online
            </button>
            <button
              className={`pb-1 ${activeFilter === 'new' ? 'text-slate-900 dark:text-white border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setActiveFilter('new')}
            >
              New
            </button>
            <button
              className={`pb-1 ${activeFilter === 'popular' ? 'text-slate-900 dark:text-white border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setActiveFilter('popular')}
            >
              Popular
            </button>
          </div>
          <button onClick={fetchProfiles} className="text-primary p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-3 space-y-2 pb-24">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && profiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No profiles found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No approved female profiles are available right now. Check back later!
            </p>
          </div>
        )}

        {/* Profile List */}
        {!isLoading && !error && profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white dark:bg-[#2d1a24] rounded-2xl shadow-sm border border-pink-100/60 dark:border-pink-900/30 px-3 py-2.5 flex items-center gap-3"
          >
            <div className="relative">
              <img
                src={profile.avatar || 'https://via.placeholder.com/48?text=?'}
                alt={profile.name}
                className="h-12 w-12 rounded-xl object-cover border border-pink-100 dark:border-pink-800 cursor-pointer"
                onClick={() => handleProfileClick(profile.id)}
              />
              {profile.isOnline && (
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white dark:ring-[#2d1a24]" />
              )}
            </div>
            <div className="flex-1 min-w-0" onClick={() => handleProfileClick(profile.id)}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{profile.name}</p>
                {profile.occupation && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300">
                    {profile.occupation}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-300">
                {profile.location && <span>{profile.location}</span>}
                {profile.age && <span>• {profile.age} yrs</span>}
              </div>
              {profile.bio && (
                <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5 line-clamp-1">
                  {profile.bio}
                </p>
              )}
            </div>
            <button
              onClick={() => handleSendHi(profile.id)}
              disabled={sendingHiTo === profile.id}
              className="px-3 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-primary to-rose-500 shadow-md active:scale-95 transition-transform disabled:opacity-50"
            >
              {sendingHiTo === profile.id ? (
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
              ) : (
                'Hi'
              )}
            </button>
          </div>
        ))}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};
