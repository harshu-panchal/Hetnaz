import { useState, useEffect } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { CoinPlanEditor } from '../components/CoinPlanEditor';
import { PayoutSlabEditor } from '../components/PayoutSlabEditor';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import walletService from '../../../core/services/wallet.service';
import type { CoinPlan, PayoutSlab, MessageCosts } from '../types/admin.types';
import type { CoinPlan as WalletCoinPlan, PayoutSlab as WalletPayoutSlab } from '../../../core/types/wallet.types';

// Default values for settings (these would come from an app settings API in production)
const defaultMessageCosts: MessageCosts = {
  basic: 20,
  silver: 18,
  gold: 16,
  platinum: 12,
  videoCall: 500,
};

const defaultWithdrawalSettings = {
  minAmount: 500,
  maxAmount: 50000,
  processingFee: 0,
  dailyLimit: 10000,
  weeklyLimit: 50000,
};

// Helper to convert wallet types to admin types
const mapWalletPlanToAdminPlan = (plan: WalletCoinPlan): CoinPlan => ({
  id: plan._id,
  name: plan.name,
  tier: plan.tier,
  priceInINR: plan.priceInINR,
  baseCoins: plan.baseCoins,
  bonusCoins: plan.bonusCoins,
  totalCoins: plan.totalCoins,
  isActive: plan.isActive,
  displayOrder: plan.displayOrder,
  badge: plan.badge === 'BEST_VALUE' ? 'BEST VALUE' : plan.badge || undefined,
});

const mapWalletSlabToAdminSlab = (slab: WalletPayoutSlab): PayoutSlab => ({
  id: slab._id,
  minCoins: slab.minCoins,
  maxCoins: slab.maxCoins,
  payoutPercentage: slab.payoutPercentage,
  displayOrder: slab.displayOrder,
});

export const CoinEconomyPage = () => {
  const [coinPlans, setCoinPlans] = useState<CoinPlan[]>([]);
  const [payoutSlabs, setPayoutSlabs] = useState<PayoutSlab[]>([]);
  const [messageCosts, setMessageCosts] = useState<MessageCosts>(defaultMessageCosts);
  const [withdrawalSettings, setWithdrawalSettings] = useState(defaultWithdrawalSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [plans, slabs] = await Promise.all([
        walletService.getAllCoinPlans(),
        walletService.getPayoutSlabs(),
      ]);

      setCoinPlans(plans.map(mapWalletPlanToAdminPlan));
      setPayoutSlabs(slabs.map(mapWalletSlabToAdminSlab));
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSaveCoinPlan = async (plan: CoinPlan) => {
    try {
      setIsSaving(true);
      setError(null);

      if (plan.id && coinPlans.find((p) => p.id === plan.id)) {
        // Update existing
        const updated = await walletService.updateCoinPlan(plan.id, {
          name: plan.name,
          tier: plan.tier,
          priceInINR: plan.priceInINR,
          baseCoins: plan.baseCoins,
          bonusCoins: plan.bonusCoins,
          badge: plan.badge || null,
          displayOrder: plan.displayOrder,
          isActive: plan.isActive,
        });
        setCoinPlans((prev) => prev.map((p) => (p.id === plan.id ? mapWalletPlanToAdminPlan(updated) : p)));
        showSuccess('Coin plan updated successfully');
      } else {
        // Add new
        const created = await walletService.createCoinPlan({
          name: plan.name,
          tier: plan.tier,
          priceInINR: plan.priceInINR,
          baseCoins: plan.baseCoins,
          bonusCoins: plan.bonusCoins,
          badge: plan.badge || null,
          displayOrder: plan.displayOrder || coinPlans.length + 1,
        });
        setCoinPlans((prev) => [...prev, mapWalletPlanToAdminPlan(created)]);
        showSuccess('Coin plan created successfully');
      }
    } catch (err: any) {
      console.error('Failed to save coin plan:', err);
      setError(err.response?.data?.message || 'Failed to save coin plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCoinPlan = async (planId: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await walletService.deleteCoinPlan(planId);
      setCoinPlans((prev) => prev.filter((p) => p.id !== planId));
      showSuccess('Coin plan deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete coin plan:', err);
      setError(err.response?.data?.message || 'Failed to delete coin plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayoutSlab = async (slab: PayoutSlab) => {
    try {
      setIsSaving(true);
      setError(null);

      if (slab.id && payoutSlabs.find((s) => s.id === slab.id)) {
        // Update existing
        const updated = await walletService.updatePayoutSlab(slab.id, {
          minCoins: slab.minCoins,
          maxCoins: slab.maxCoins,
          payoutPercentage: slab.payoutPercentage,
          displayOrder: slab.displayOrder,
        });
        setPayoutSlabs((prev) => prev.map((s) => (s.id === slab.id ? mapWalletSlabToAdminSlab(updated) : s)));
        showSuccess('Payout slab updated successfully');
      } else {
        // Add new
        const created = await walletService.createPayoutSlab({
          minCoins: slab.minCoins,
          maxCoins: slab.maxCoins,
          payoutPercentage: slab.payoutPercentage,
          displayOrder: slab.displayOrder || payoutSlabs.length + 1,
        });
        setPayoutSlabs((prev) => [...prev, mapWalletSlabToAdminSlab(created)]);
        showSuccess('Payout slab created successfully');
      }
    } catch (err: any) {
      console.error('Failed to save payout slab:', err);
      setError(err.response?.data?.message || 'Failed to save payout slab');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayoutSlab = async (slabId: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await walletService.deletePayoutSlab(slabId);
      setPayoutSlabs((prev) => prev.filter((s) => s.id !== slabId));
      showSuccess('Payout slab deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete payout slab:', err);
      setError(err.response?.data?.message || 'Failed to delete payout slab');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMessageCosts = () => {
    setHasChanges(false);
    // TODO: Implement when app settings API is available
    showSuccess('Message costs saved (local only - API pending)');
  };

  const handleSaveWithdrawalSettings = () => {
    setHasChanges(false);
    // TODO: Implement when app settings API is available
    showSuccess('Withdrawal settings saved (local only - API pending)');
  };

  const handleSaveAll = () => {
    handleSaveMessageCosts();
    handleSaveWithdrawalSettings();
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Coin Economy</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage coin plans, payout slabs, message costs, and withdrawal settings
              </p>
            </div>
            {hasChanges && (
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <MaterialSymbol name="save" size={20} />
                Save All Changes
              </button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
              <MaterialSymbol name="error" className="text-red-500" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto"><MaterialSymbol name="close" size={18} /></button>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">
              <MaterialSymbol name="check_circle" className="text-green-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Saving Overlay */}
          {isSaving && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            </div>
          )}

          {/* Coin Plans Section */}
          {!isLoading && (
            <div className="mb-6">
              <CoinPlanEditor
                plans={coinPlans}
                onSave={handleSaveCoinPlan}
                onDelete={handleDeleteCoinPlan}
                onAdd={() => { }}
              />
            </div>
          )}

          {/* Payout Slabs Section */}
          {!isLoading && (
            <div className="mb-6">
              <PayoutSlabEditor
                slabs={payoutSlabs}
                onSave={handleSavePayoutSlab}
                onDelete={handleDeletePayoutSlab}
                onAdd={() => { }}
              />
            </div>
          )}

          {/* Message Costs Section */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Message Costs</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Configure coin costs for messages and video calls by tier
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Basic Tier
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={messageCosts.basic}
                    onChange={(e) =>
                      setMessageCosts({ ...messageCosts, basic: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    coins
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Silver Tier
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={messageCosts.silver}
                    onChange={(e) =>
                      setMessageCosts({ ...messageCosts, silver: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    coins
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gold Tier
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={messageCosts.gold}
                    onChange={(e) =>
                      setMessageCosts({ ...messageCosts, gold: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    coins
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platinum Tier
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={messageCosts.platinum}
                    onChange={(e) =>
                      setMessageCosts({ ...messageCosts, platinum: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    coins
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Video Call
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={messageCosts.videoCall}
                    onChange={(e) =>
                      setMessageCosts({ ...messageCosts, videoCall: parseInt(e.target.value) || 0 })
                    }
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

            <button
              onClick={handleSaveMessageCosts}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Message Costs
            </button>
          </div>

          {/* Withdrawal Settings Section */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Withdrawal Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Configure withdrawal limits and processing fees
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Amount (coins)
                </label>
                <input
                  type="number"
                  value={withdrawalSettings.minAmount}
                  onChange={(e) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      minAmount: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Amount (coins)
                </label>
                <input
                  type="number"
                  value={withdrawalSettings.maxAmount}
                  onChange={(e) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      maxAmount: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Processing Fee (coins)
                </label>
                <input
                  type="number"
                  value={withdrawalSettings.processingFee}
                  onChange={(e) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      processingFee: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Limit (coins)
                </label>
                <input
                  type="number"
                  value={withdrawalSettings.dailyLimit}
                  onChange={(e) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      dailyLimit: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weekly Limit (coins)
                </label>
                <input
                  type="number"
                  value={withdrawalSettings.weeklyLimit}
                  onChange={(e) =>
                    setWithdrawalSettings({
                      ...withdrawalSettings,
                      weeklyLimit: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleSaveWithdrawalSettings}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Withdrawal Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

