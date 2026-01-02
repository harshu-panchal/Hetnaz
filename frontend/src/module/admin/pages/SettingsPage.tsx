import { useState, useEffect } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import adminService from '../../../core/services/admin.service';
import type { AdminSettings, AdminGift } from '../types/admin.types';

// Mock data - replace with actual API calls
const mockSettings: AdminSettings = {
  general: {
    platformName: 'MatchMint',
    supportEmail: 'support@matchmint.com',
    supportPhone: '+91 9876543210',
    termsOfServiceUrl: 'https://matchmint.com/terms',
    privacyPolicyUrl: 'https://matchmint.com/privacy',
    maintenanceMode: false,
    registrationEnabled: true,
  },
  withdrawal: {
    minAmount: 500,
    maxAmount: 50000,
    processingFee: 0,
    dailyLimit: 10000,
    weeklyLimit: 50000,
  },
  messageCosts: {
    basic: 50,
    silver: 45,
    gold: 40,
    platinum: 35,
    hiMessage: 5,
    imageMessage: 100,
    videoCall: 500,
  },
  giftCosts: {
    defaultCost: 100,
  },
};

export const SettingsPage = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [gifts, setGifts] = useState<AdminGift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGifts, setIsLoadingGifts] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'withdrawal' | 'coin-costs' | 'gifts'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSettings();
    fetchGifts();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAppSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGifts = async () => {
    try {
      setIsLoadingGifts(true);
      const data = await adminService.listGifts();
      setGifts(data);
    } catch (error) {
      console.error('Failed to fetch gifts:', error);
    } finally {
      setIsLoadingGifts(false);
    }
  };

  const handleGeneralChange = (field: keyof AdminSettings['general'], value: string | boolean) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        general: {
          ...prev.general,
          [field]: value,
        },
      };
    });
    setHasChanges(true);
  };

  const handleWithdrawalChange = (field: keyof AdminSettings['withdrawal'], value: number) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        withdrawal: {
          ...prev.withdrawal,
          [field]: value,
        },
      };
    });
    setHasChanges(true);
  };

  const handleMessageCostChange = (field: keyof AdminSettings['messageCosts'], value: number) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messageCosts: {
          ...prev.messageCosts,
          [field]: value,
        },
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await adminService.updateAppSettings(settings);
      setHasChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGiftCostUpdate = async (giftId: string, newCost: number) => {
    try {
      await adminService.updateGiftCost(giftId, newCost);
      setGifts(prev => prev.map(g => g._id === giftId ? { ...g, cost: newCost } : g));
      alert('Gift cost updated successfully!');
    } catch (error) {
      console.error('Failed to update gift cost:', error);
      alert('Failed to update gift cost. Please try again.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      setSettings(mockSettings);
      setHasChanges(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'withdrawal', label: 'Withdrawal', icon: 'account_balance_wallet' },
    { id: 'coin-costs', label: 'Coin Costs', icon: 'monetization_on' },
    { id: 'gifts', label: 'Gifts', icon: 'card_giftcard' },
  ];

  if (isLoading || !settings) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <MaterialSymbol name="hourglass_empty" size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gray-50 dark:bg-[#0a0a0a] overflow-x-hidden">
      {/* Top Navbar */}
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Configure platform settings and preferences</p>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <MaterialSymbol name="hourglass_empty" size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <MaterialSymbol name="save" size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors border-b-2 ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <MaterialSymbol name={tab.icon} size={20} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">General Settings</h2>
                <div className="space-y-6">
                  {/* Platform Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.platformName}
                      onChange={(e) => handleGeneralChange('platformName', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Support Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Support Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.general.supportPhone}
                      onChange={(e) => handleGeneralChange('supportPhone', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Terms of Service URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Terms of Service URL
                    </label>
                    <input
                      type="url"
                      value={settings.general.termsOfServiceUrl}
                      onChange={(e) => handleGeneralChange('termsOfServiceUrl', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Privacy Policy URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Privacy Policy URL
                    </label>
                    <input
                      type="url"
                      value={settings.general.privacyPolicyUrl}
                      onChange={(e) => handleGeneralChange('privacyPolicyUrl', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Maintenance Mode
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          When enabled, the platform will be unavailable to users
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.maintenanceMode}
                          onChange={(e) => handleGeneralChange('maintenanceMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Registration Enabled
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Allow new users to register on the platform
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.registrationEnabled}
                          onChange={(e) => handleGeneralChange('registrationEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Withdrawal Settings */}
            {activeTab === 'withdrawal' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Withdrawal Settings</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Minimum Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Minimum Amount (coins)
                      </label>
                      <input
                        type="number"
                        value={settings.withdrawal.minAmount}
                        onChange={(e) => handleWithdrawalChange('minAmount', parseInt(e.target.value) || 0)}
                        min="0"
                        step="1"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Maximum Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maximum Amount (coins)
                      </label>
                      <input
                        type="number"
                        value={settings.withdrawal.maxAmount}
                        onChange={(e) => handleWithdrawalChange('maxAmount', parseInt(e.target.value) || 0)}
                        min="0"
                        step="1"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Processing Fee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Processing Fee (coins)
                      </label>
                      <input
                        type="number"
                        value={settings.withdrawal.processingFee}
                        onChange={(e) => handleWithdrawalChange('processingFee', parseInt(e.target.value) || 0)}
                        min="0"
                        step="1"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Daily Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Daily Limit (coins)
                      </label>
                      <input
                        type="number"
                        value={settings.withdrawal.dailyLimit}
                        onChange={(e) => handleWithdrawalChange('dailyLimit', parseInt(e.target.value) || 0)}
                        min="0"
                        step="1"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Weekly Limit */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Weekly Limit (coins)
                      </label>
                      <input
                        type="number"
                        value={settings.withdrawal.weeklyLimit}
                        onChange={(e) => handleWithdrawalChange('weeklyLimit', parseInt(e.target.value) || 0)}
                        min="0"
                        step="1"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Coin Costs Settings */}
            {activeTab === 'coin-costs' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Coin Costs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Configure coin costs for messages, special features, and video calls
                </p>
                <div className="space-y-6">
                  {/* Regular Messages Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Regular Messages (Tier-Based)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Basic Tier */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Basic Tier
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.messageCosts.basic}
                            onChange={(e) => handleMessageCostChange('basic', parseInt(e.target.value) || 0)}
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            coins
                          </span>
                        </div>
                      </div>

                      {/* Silver Tier */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Silver Tier
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.messageCosts.silver}
                            onChange={(e) => handleMessageCostChange('silver', parseInt(e.target.value) || 0)}
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            coins
                          </span>
                        </div>
                      </div>

                      {/* Gold Tier */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Gold Tier
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.messageCosts.gold}
                            onChange={(e) => handleMessageCostChange('gold', parseInt(e.target.value) || 0)}
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            coins
                          </span>
                        </div>
                      </div>

                      {/* Platinum Tier */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Platinum Tier
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.messageCosts.platinum}
                            onChange={(e) => handleMessageCostChange('platinum', parseInt(e.target.value) || 0)}
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            coins
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Messages Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Special Messages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Hi Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First "Hi" Message
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.messageCosts.hiMessage}
                            onChange={(e) => handleMessageCostChange('hiMessage', parseInt(e.target.value) || 0)}
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            coins
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cost for the initial "Hi" message to start a conversation</p>
                      </div>

                      {/* Image Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Image/Photo Message
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.messageCosts.imageMessage}
                            onChange={(e) => handleMessageCostChange('imageMessage', parseInt(e.target.value) || 0)}
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            coins
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cost for sending an image or taking a photo in chat</p>
                      </div>
                    </div>
                  </div>

                  {/* Video Call Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Video Calls</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Video Call */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Video Call Cost (per call)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.messageCosts.videoCall}
                            onChange={(e) => handleMessageCostChange('videoCall', parseInt(e.target.value) || 0)}
                            min="0"
                            step="1"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            coins
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gifts Tab */}
            {activeTab === 'gifts' && (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Gift Costs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Configure costs for individual gifts
                </p>
                {isLoadingGifts ? (
                  <div className="flex items-center justify-center py-12">
                    <MaterialSymbol name="hourglass_empty" size={48} className="animate-spin text-blue-600" />
                  </div>
                ) : gifts.length === 0 ? (
                  <div className="text-center py-12">
                    <MaterialSymbol name="card_giftcard" size={64} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No gifts found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gifts.map((gift) => (
                      <div key={gift._id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                          <img src={gift.imageUrl} alt={gift.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{gift.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{gift.category}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="number"
                                value={gift.cost}
                                onChange={(e) => {
                                  const newCost = parseInt(e.target.value) || 0;
                                  if (newCost !== gift.cost) {
                                    handleGiftCostUpdate(gift._id, newCost);
                                  }
                                }}
                                min="0"
                                step="1"
                                className="w-24 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-500 dark:text-gray-400">coins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Banner */}
          {hasChanges && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
              <MaterialSymbol name="info" className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">You have unsaved changes</p>
                <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                  Don't forget to save your changes before leaving this page.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

