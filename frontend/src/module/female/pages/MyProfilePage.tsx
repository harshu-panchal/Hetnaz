// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { FemaleTopNavbar } from '../components/FemaleTopNavbar';
import { FemaleSidebar } from '../components/FemaleSidebar';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import { EditProfileModal } from '../components/EditProfileModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const MyProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useFemaleNavigation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Local display state (synced with user)
  const [name, setName] = useState(user?.name || 'Anonymous');
  const [age, setAge] = useState(24);
  const [location, setLocation] = useState('New York, USA');

  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowMessagesFrom, setAllowMessagesFrom] = useState<'everyone' | 'verified'>('everyone');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Stats
  const stats = {
    messagesReceived: 1247,
    profileViews: 3421,
    activeConversations: 23,
    totalEarnings: 15250,
    availableBalance: 12450,
  };

  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || 'Anonymous');
      setAge(user.age || 24);
      setLocation(user.location || user.city || 'Unknown Location');

      if (user.photos && user.photos.length > 0) {
        setPhotos(user.photos);
      } else if (user.avatarUrl) {
        setPhotos([user.avatarUrl]);
      } else {
        setPhotos([]);
      }
    }
  }, [user]);

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      {/* Top Navbar */}
      <FemaleTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <FemaleSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
          >
            <MaterialSymbol name="arrow_back" size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">My Profile</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">
        {/* Profile Header Card - Clickable */}
        <div
          onClick={() => setIsEditModalOpen(true)}
          className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/5 dark:to-transparent rounded-2xl p-6 border border-primary/20 cursor-pointer active:scale-[0.98] transition-all hover:bg-primary/5 dark:hover:bg-[#342d18]/50"
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div
                className="h-32 w-32 rounded-full bg-center bg-no-repeat bg-cover border-4 border-white dark:border-[#342d18] shadow-lg"
                style={{
                  backgroundImage: photos.length > 0 ? `url("${photos[0]}")` : undefined,
                  backgroundColor: photos.length === 0 ? '#e5e7eb' : undefined,
                }}
              />
              <div className="absolute bottom-1 right-1 bg-gray-900/80 p-1.5 rounded-full text-white">
                <MaterialSymbol name="edit" size={14} />
              </div>
              <div className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-2 border-white dark:border-[#342d18]">
                <div className="h-3 w-3 rounded-full bg-white" />
              </div>
            </div>

            <div className="text-center mb-0">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h2>
                <MaterialSymbol name="verified" className="text-blue-500" size={20} />
              </div>
              <p className="text-sm text-gray-600 dark:text-[#cbbc90]">{age} years old</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <MaterialSymbol name="location_on" size={16} className="text-gray-500 dark:text-[#cbbc90]" />
                <p className="text-sm text-gray-600 dark:text-[#cbbc90]">{location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="rounded-xl px-6 py-4 bg-green-50 dark:bg-green-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <MaterialSymbol name="verified" className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile Verified</p>
              <p className="text-xs text-gray-600 dark:text-[#cbbc90]">Your profile has been verified by our team</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <MaterialSymbol name="mail" className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.messagesReceived.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-[#cbbc90] mt-1">Messages</p>
          </div>

          <div className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <MaterialSymbol name="visibility" className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.profileViews.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-[#cbbc90] mt-1">Views</p>
          </div>

          <div className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <MaterialSymbol name="chat_bubble" className="text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeConversations}</p>
            <p className="text-xs text-gray-500 dark:text-[#cbbc90] mt-1">Chats</p>
          </div>
        </div>

        {/* Earnings Preview */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-[#cbbc90] mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.availableBalance.toLocaleString()} coins</p>
            </div>
            <button
              onClick={() => navigate('/female/earnings')}
              className="px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
            >
              View Earnings
            </button>
          </div>
        </div>

        {/* Photo Gallery - Read Only */}
        {photos.length > 0 && (
          <div className="bg-white dark:bg-[#342d18] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Photos</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-[#2a2515]">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-slate-900 text-xs font-bold px-2 py-1 rounded">
                      Profile
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Summary */}
        <div className="bg-white dark:bg-[#342d18] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MaterialSymbol name="insights" className="text-primary" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Summary</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#2a2515] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <MaterialSymbol name="trending_up" className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Views This Week</p>
                  <p className="text-xs text-gray-500 dark:text-[#cbbc90]">+12% from last week</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">342</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#2a2515] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <MaterialSymbol name="chat_bubble" className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Active Conversations</p>
                  <p className="text-xs text-gray-500 dark:text-[#cbbc90]">23 ongoing chats</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">23</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#2a2515] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <MaterialSymbol name="account_balance_wallet" className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Total Earnings</p>
                  <p className="text-xs text-gray-500 dark:text-[#cbbc90]">All time earnings</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white dark:bg-[#342d18] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <MaterialSymbol name="settings" className="text-primary" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h3>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-white/5">
            {/* Privacy Settings */}
            <div className="px-6 py-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-[#cbbc90] mb-3">Privacy</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Show Online Status</p>
                    <p className="text-xs text-gray-500 dark:text-[#cbbc90]">Let others see when you're online</p>
                  </div>
                  <button
                    onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showOnlineStatus ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Who Can Message Me</p>
                    <p className="text-xs text-gray-500 dark:text-[#cbbc90]">Control who can send you messages</p>
                  </div>
                  <select
                    value={allowMessagesFrom}
                    onChange={(e) => setAllowMessagesFrom(e.target.value as 'everyone' | 'verified')}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="verified">Verified Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="px-6 py-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-[#cbbc90] mb-3">Notifications</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-[#cbbc90]">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-[#cbbc90]">Receive push notifications on device</p>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="px-6 py-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-[#cbbc90] mb-3">Account</h4>

              <div className="space-y-2">
                <button
                  onClick={() => navigate('/female/auto-messages')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2515] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MaterialSymbol name="smart_toy" className="text-gray-600 dark:text-[#cbbc90]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Auto Messages</span>
                  </div>
                  <MaterialSymbol name="chevron_right" className="text-gray-400" />
                </button>

                <button
                  onClick={() => {
                    // TODO: Implement change password
                    alert('Change password functionality coming soon');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2515] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MaterialSymbol name="lock" className="text-gray-600 dark:text-[#cbbc90]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Change Password</span>
                  </div>
                  <MaterialSymbol name="chevron_right" className="text-gray-400" />
                </button>

                <button
                  onClick={() => {
                    // TODO: Implement account deletion
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      alert('Account deletion functionality coming soon');
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MaterialSymbol name="delete" className="text-red-500" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</span>
                  </div>
                  <MaterialSymbol name="chevron_right" className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};
