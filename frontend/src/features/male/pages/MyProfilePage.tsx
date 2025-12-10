import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/TopAppBar';
import { BottomNavigation } from '../components/BottomNavigation';
import { MaterialSymbol } from '../types/material-symbol';

// Mock data - replace with actual API calls
const mockProfile = {
  id: 'me',
  name: 'John Doe',
  age: 28,
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoS_YLtV4hpNVbbyf0nrVmbQX6vzgn-xGLdye-t2gBz0LRib9HX4PeYJIj364IRM63hBRKmTLtWfuVOfikvNIryKKMjql6Ig1suPsbWoA45Vt8rO0N-wt7qwqIwMBV4Gaw6j7ooJER4L9QExcc20SNkyk1schLm-swXJOgx5ez3objGGhUPZpOMLYRY2W5WgHwClZhJ-JaWw470QybQVyCQD-hZYfamq_iJqx0EAJE0UNaa6Ee3_FbUUYSuUIIViQ_QxI6ytCepxc',
  bio: 'Love traveling and exploring new places. Looking for someone to share adventures with!',
  occupation: 'Software Engineer',
  city: 'Mumbai',
  interests: ['Travel', 'Photography', 'Hiking', 'Music'],
  preferences: {
    ageRange: { min: 22, max: 35 },
    maxDistance: 50,
    interests: ['Travel', 'Photography'],
  },
};

const navigationItems = [
  { id: 'discover', icon: 'explore', label: 'Discover' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats', hasBadge: true },
  { id: 'wallet', icon: 'monetization_on', label: 'Wallet' },
  { id: 'profile', icon: 'person', label: 'Profile', isActive: true },
];

export const MyProfilePage = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState(mockProfile);
  const [editedProfile, setEditedProfile] = useState(mockProfile);

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedProfile({ ...profile });
  };

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditMode(false);
    // TODO: API call to save profile
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditMode(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile({
          ...editedProfile,
          avatar: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'discover':
        navigate('/discover');
        break;
      case 'chats':
        navigate('/chats');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'profile':
        navigate('/my-profile');
        break;
      default:
        break;
    }
  };

  const currentProfile = isEditMode ? editedProfile : profile;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      {/* Top App Bar */}
      <TopAppBar
        title={isEditMode ? 'Edit Profile' : 'My Profile'}
        icon="person"
        onFilterClick={() => {}}
        onSearch={() => {}}
      />

      {/* Profile Content */}
      <main className="p-4 space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={currentProfile.avatar}
              alt={currentProfile.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary"
            />
            {isEditMode && (
              <label className="absolute bottom-0 right-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors active:scale-95">
                <MaterialSymbol name="camera_alt" size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {!isEditMode && (
            <button
              onClick={handleEdit}
              className="mt-4 px-6 py-2 bg-primary text-[#231d10] font-semibold rounded-xl hover:bg-primary/90 transition-colors active:scale-95"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="bg-white dark:bg-[#342d18] rounded-2xl p-4 shadow-sm space-y-4">
          {/* Name and Age */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Name
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2f151e] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-lg font-bold">{profile.name}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Age
            </label>
            {isEditMode ? (
              <input
                type="number"
                min="18"
                max="100"
                value={editedProfile.age}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, age: parseInt(e.target.value) || 18 })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2f151e] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-base">{profile.age} years old</p>
            )}
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Occupation
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={editedProfile.occupation || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, occupation: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2f151e] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your occupation"
              />
            ) : (
              <p className="text-base">{profile.occupation || 'Not specified'}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              City
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={editedProfile.city || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, city: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2f151e] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your city"
              />
            ) : (
              <p className="text-base">{profile.city || 'Not specified'}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Bio
            </label>
            {isEditMode ? (
              <textarea
                value={editedProfile.bio || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, bio: e.target.value })
                }
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2f151e] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-base text-gray-700 dark:text-gray-300">
                {profile.bio || 'No bio yet'}
              </p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {currentProfile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        {!isEditMode && (
          <div className="bg-white dark:bg-[#342d18] rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Preferences</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Age Range</span>
                <span className="font-medium">
                  {profile.preferences.ageRange.min} - {profile.preferences.ageRange.max} years
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max Distance</span>
                <span className="font-medium">{profile.preferences.maxDistance} km</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons (Edit Mode) */}
        {isEditMode && (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 h-12 bg-gray-100 dark:bg-[#2f151e] text-slate-700 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-[#342d18] transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-12 bg-primary text-[#231d10] font-semibold rounded-xl hover:bg-primary/90 transition-colors active:scale-95"
            >
              Save Changes
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};


