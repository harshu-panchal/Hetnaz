import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';

const navigationItems = [
  { id: 'dashboard', icon: 'home', label: 'Home' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats' },
  { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
  { id: 'profile', icon: 'person', label: 'Profile', isActive: true },
];

export const MyProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Emma');
  const [age, setAge] = useState(24);
  const [location, setLocation] = useState('New York, USA');
  const [bio, setBio] = useState('Love traveling and meeting new people! 🌍');
  const [interests, setInterests] = useState(['Travel', 'Photography', 'Music', 'Fitness']);
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

  const [photos, setPhotos] = useState<string[]>([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC81hkr7IkYx1ryaWF6XEKAw50xyRvJBGMogrF-zD5ChG66QAopPNWZvczWXWXasmarotX6xfLiXqIGT-HGa4N4mpnfl6tHPN16fBm5L0ebBFFR6YnfhOhNpt_PXB-rNdw4iozv00ERuqlCKno-B1P2UZ6g-dU5YY4Or_m3Xdgk4_MrxVK9o6Uz70Vr_fXQdMhSrjjCl7s_yQE_R1O9FNwroQqdfSFv6kiO76qVxmnHDhLrYwRWtfdSdegsNjAzgAdgkUZgUomw2j8',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBNnKyZLNWCV7B-XwKgjd9-bbG9ZSq583oYGij7uKTYk2Ah_9nkpqgsGSDu-FUgux5QDiLCTw_y9JxTBhkZjWAOOReMhlK98A_84vIsKaxQ0IUzZqkJ7-wnAv67HRuUVltC2QQzOfbTk1-OdjqC7SWT4iG-MXs81ePZK3x1mYOHabRqp4eH7yIfiX3tH-YMXSs1uWS41vrxzPC8_MJHasLGiUWINfHYQ7KF2jfo0n_Yo6qBJKr_qMrOBUdimUVVJdY46GD7L0v-oL4',
  ]);

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

  const handleSave = () => {
    // TODO: Implement save profile
    setIsEditing(false);
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            setPhotos((prev) => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetProfilePhoto = (index: number) => {
    const newPhotos = [...photos];
    const [selectedPhoto] = newPhotos.splice(index, 1);
    newPhotos.unshift(selectedPhoto);
    setPhotos(newPhotos);
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
          >
            <MaterialSymbol name="arrow_back" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        </div>
        {isEditing ? (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gray-200 dark:bg-[#342d18] text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors"
          >
            Edit
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/5 dark:to-transparent rounded-2xl p-6 border border-primary/20">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div
                className="h-32 w-32 rounded-full bg-center bg-no-repeat bg-cover border-4 border-white dark:border-[#342d18] shadow-lg"
                style={{
                  backgroundImage: photos.length > 0 ? `url("${photos[0]}")` : undefined,
                  backgroundColor: photos.length === 0 ? '#e5e7eb' : undefined,
                }}
              />
              {isEditing && (
                <button
                  onClick={handlePhotoUpload}
                  className="absolute bottom-0 right-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-slate-900 border-2 border-white dark:border-[#342d18] hover:bg-yellow-400 transition-colors shadow-lg"
                >
                  <MaterialSymbol name="camera_alt" size={20} />
                </button>
              )}
              <div className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-2 border-white dark:border-[#342d18]">
                <div className="h-3 w-3 rounded-full bg-white" />
              </div>
            </div>
            
            <div className="text-center mb-4">
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

            {isEditing && (
              <button
                onClick={handlePhotoUpload}
                className="px-4 py-2 bg-white dark:bg-[#342d18] text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#4b202e] transition-colors text-sm font-medium shadow-sm"
              >
                Change Profile Photo
              </button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
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

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="bg-white dark:bg-[#342d18] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Photos</h3>
              {isEditing && (
                <button
                  onClick={handlePhotoUpload}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-slate-900 text-sm font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  <MaterialSymbol name="add" size={18} />
                  Add Photos
                </button>
              )}
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
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {index !== 0 && (
                        <button
                          onClick={() => handleSetProfilePhoto(index)}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                          title="Set as profile photo"
                        >
                          <MaterialSymbol name="star" size={20} className="text-primary" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(index)}
                        className="p-2 bg-red-500/90 rounded-full hover:bg-red-600 transition-colors"
                        title="Delete photo"
                      >
                        <MaterialSymbol name="delete" size={20} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isEditing && photos.length < 9 && (
                <button
                  onClick={handlePhotoUpload}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center hover:border-primary dark:hover:border-primary transition-colors"
                >
                  <MaterialSymbol name="add" size={32} className="text-gray-400 dark:text-gray-500 mb-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Add Photo</span>
                </button>
              )}
            </div>
            {photos.length === 0 && (
              <div className="text-center py-8">
                <MaterialSymbol name="photo_library" size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-[#cbbc90] text-sm">No photos yet</p>
                {isEditing && (
                  <button
                    onClick={handlePhotoUpload}
                    className="mt-4 px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
                  >
                    Add Your First Photo
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Profile Info */}
        <div className="bg-white dark:bg-[#342d18] rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <MaterialSymbol name="person" className="text-primary" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">About Me</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <p className="text-gray-900 dark:text-white font-medium">{name}</p>
            )}
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                min={18}
                max={100}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell others about yourself..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{bio}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-3">
              Interests
            </label>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 rounded-full">
                    <input
                      type="text"
                      value={interest}
                      onChange={(e) => {
                        const newInterests = [...interests];
                        newInterests[index] = e.target.value;
                        setInterests(newInterests);
                      }}
                      className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 dark:text-white w-24"
                    />
                    <button
                      onClick={() => setInterests(interests.filter((_, i) => i !== index))}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <MaterialSymbol name="close" size={16} />
                    </button>
                  </div>
                ))}
                {interests.length < 6 && (
                  <button
                    onClick={() => setInterests([...interests, ''])}
                    className="px-3 py-1.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:border-primary dark:hover:border-primary transition-colors"
                  >
                    + Add
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 rounded-full text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showOnlineStatus ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-1'
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pushNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pushNotifications ? 'translate-x-6' : 'translate-x-1'
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

            {/* Verification Status */}
            <div className="px-6 py-4 bg-green-50 dark:bg-green-900/10">
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
          </div>
        </div>
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

