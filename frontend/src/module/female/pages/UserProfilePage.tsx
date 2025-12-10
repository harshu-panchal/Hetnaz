import { useParams, useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';

// Mock data - replace with actual API call
interface UserProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  distance?: string;
  isOnline: boolean;
  occupation?: string;
  bio?: string;
  photos?: string[];
}

const mockProfiles: Record<string, UserProfile> = {
  '1': {
    id: '1',
    name: 'John',
    age: 28,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNnKyZLNWCV7B-XwKgjd9-bbG9ZSq583oYGij7uKTYk2Ah_9nkpqgsGSDu-FUgux5QDiLCTw_y9JxTBhkZjWAOOReMhlK98A_84vIsKaxQ0IUzZqkJ7-wnAv67HRuUVltC2QQzOfbTk1-OdjqC7SWT4iG-MXs81ePZK3x1mYOHabRqp4eH7yIfiX3tH-YMXSs1uWS41vrxzPC8_MJHasLGiUWINfHYQ7KF2jfo0n_Yo6qBJKr_qMrOBUdimUVVJdY46GD7L0v-oL4',
    distance: '1.2 km',
    isOnline: true,
    occupation: 'Engineer',
    bio: 'Love traveling and photography',
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBNnKyZLNWCV7B-XwKgjd9-bbG9ZSq583oYGij7uKTYk2Ah_9nkpqgsGSDu-FUgux5QDiLCTw_y9JxTBhkZjWAOOReMhlK98A_84vIsKaxQ0IUzZqkJ7-wnAv67HRuUVltC2QQzOfbTk1-OdjqC7SWT4iG-MXs81ePZK3x1mYOHabRqp4eH7yIfiX3tH-YMXSs1uWS41vrxzPC8_MJHasLGiUWINfHYQ7KF2jfo0n_Yo6qBJKr_qMrOBUdimUVVJdY46GD7L0v-oL4',
    ],
  },
  '2': {
    id: '2',
    name: 'Mike',
    age: 25,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHxrviFMtsvG_Idvc-7NLJcibIA3HzpSimrSGtu5nkdVXQ0lR_v5vA3Ze5PcHiEZqXs444SJmue_gn-BAJpC_N4OBtiZ76IDvr9bLR_SxT5dQNp7j5WAWAzR9Cc6wdHAOpqLvxURxJbRcG1oN1Y1usF6uro9rSV6FLFxuNnpI_KIDdXzO8GH9BtmEm-Da4mrHV39aDrH-gGMTms5x6GJrf9pvOpfKnux5C1cD8_KgfRomNHp0HOgf-8TefyOTLXglCq3P1RsbOOf8',
    distance: '3.5 km',
    isOnline: false,
    occupation: 'Designer',
    bio: 'Creative soul',
  },
  '3': {
    id: '3',
    name: 'David',
    age: 30,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMwDNlS8xIMG2GPDOruau0I96EJW8UAfXypa6c3-bkakWGNwuNHv4bT_JxAS2tQQbwxDbRjkJCejmcZYfsqqtKJ-7OeHLwq5E9n5xOPyVwVLwv6bLTSaWBddBnCfSb85sZZW5ciF9ASv_TmzTFU3HcRlJPBSmBmvslJ_3dhEuuYLb5gfEYKw8ahTEUs9Nr49VBtnu-s1Y--7W9Kv1e7XebTvnXhrZ42e1cYEMDxGbgmAHw0fTnNAuBciEyspzTK1qCjMHkoxWkXPw',
    distance: '500 m',
    isOnline: true,
    bio: 'Fitness enthusiast',
  },
};

const navigationItems = [
  { id: 'dashboard', icon: 'home', label: 'Home' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats' },
  { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

export const UserProfilePage = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();

  const profile = profileId ? mockProfiles[profileId] : null;

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleChatClick = () => {
    if (profile) {
      // Navigate to chat - create new chat or open existing
      navigate(`/female/chat/${profile.id}`);
    }
  };

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/female/dashboard');
        break;
      case 'chats':
        navigate('/female/chats');
        break;
      case 'earnings':
        navigate('/female/earnings');
        break;
      case 'profile':
        navigate('/female/my-profile');
        break;
      default:
        break;
    }
  };

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark pb-20">
        <div className="text-center">
          <MaterialSymbol name="person_off" size={48} className="text-gray-400 dark:text-gray-600 mb-4 mx-auto" />
          <p className="text-gray-500 dark:text-[#cbbc90]">Profile not found</p>
          <button
            onClick={handleBackClick}
            className="mt-4 px-4 py-2 bg-primary text-slate-900 rounded-xl font-medium"
          >
            Go Back
          </button>
        </div>
        <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-20 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
            aria-label="Go back"
          >
            <MaterialSymbol name="arrow_back" size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Profile</h1>
          <div className="size-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Profile Image */}
      <div className="relative w-full aspect-[3/4] bg-gray-200 dark:bg-[#342d18]">
        <img
          alt={`${profile.name} profile picture`}
          className="absolute inset-0 h-full w-full object-cover"
          src={profile.avatar}
        />
        {/* Distance Badge */}
        {profile.distance && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5">
              <MaterialSymbol name="location_on" size={16} className="text-white" />
              <span className="text-xs font-bold text-white">{profile.distance}</span>
            </div>
          </div>
        )}
        {/* Online Status Badge */}
        {profile.isOnline && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 rounded-full bg-green-500/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Online</span>
            </div>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-4 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {profile.name}, {profile.age}
          </h2>
          {profile.occupation && (
            <p className="text-base text-gray-600 dark:text-gray-400 mt-1">{profile.occupation}</p>
          )}
          {profile.bio && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{profile.bio}</p>
          )}
        </div>

        {/* Photo Gallery */}
        {profile.photos && profile.photos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-[#342d18]">
                  <img
                    src={photo}
                    alt={`${profile.name} photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Button */}
        <button
          onClick={handleChatClick}
          className={`w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white transition-all active:scale-95 ${
            profile.isOnline
              ? 'bg-primary hover:bg-yellow-400 shadow-lg shadow-primary/20'
              : 'bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/10'
          }`}
        >
          <MaterialSymbol name="chat_bubble" size={20} />
          <span>{profile.isOnline ? 'Start Chat' : 'Send Message'}</span>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};


