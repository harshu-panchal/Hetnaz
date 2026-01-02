import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { CoinPurchaseHeader } from '../components/CoinPurchaseHeader';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { PromoBanner } from '../components/PromoBanner';
import { CoinPlanCard } from '../components/CoinPlanCard';
import { TrustFooter } from '../components/TrustFooter';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { MaleSidebar } from '../components/MaleSidebar';
import { BottomNavigation } from '../components/BottomNavigation';
import { MembershipUpgradeModal } from '../components/MembershipUpgradeModal';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import walletService from '../../../core/services/wallet.service';
import paymentService from '../../../core/services/payment.service';
import type { CoinPlan as WalletCoinPlan } from '../../../core/types/wallet.types';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const CoinPurchasePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { updateBalance } = useGlobalState();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useMaleNavigation();

  const [coinPlans, setCoinPlans] = useState<WalletCoinPlan[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Membership upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<'silver' | 'gold' | 'platinum'>('silver');
  const [previousTier, setPreviousTier] = useState<string>('basic');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch coin plans and balance in parallel
      const [plans, balanceData] = await Promise.all([
        walletService.getCoinPlans(),
        walletService.getMyBalance().catch(() => ({ balance: 0 })),
      ]);

      setCoinPlans(plans);
      setBalance(balanceData.balance || 0);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(t('errorLoadPlans'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = () => {
    navigate('/male/purchase-history');
  };

  const handleBuyClick = async (planId: string) => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await paymentService.initiatePayment(planId, {
        name: user?.name || '',
        phone: user?.phoneNumber || '',
      });

      if (result.success) {
        setSuccessMessage(result.message);
        // Update local balance
        if (result.newBalance !== undefined) {
          setBalance(result.newBalance);
          // Update in global state context
          updateBalance(result.newBalance);
          // Update in auth context as well if available
          updateUser?.({ coinBalance: result.newBalance });
        }

        // Check if membership was upgraded - show celebration modal
        if (result.membershipUpgraded && result.newTier) {
          setPreviousTier(result.previousTier || 'basic');
          setUpgradeTier(result.newTier);

          // Update auth context with new membership tier
          updateUser?.({ memberTier: result.newTier });

          // Small delay to let the purchase overlay close first
          setTimeout(() => {
            setShowUpgradeModal(true);
          }, 300);
        }

        // Refresh data after successful purchase
        setTimeout(() => {
          fetchData();
          setSuccessMessage(null);
        }, 3000);
      } else {
        if (result.error !== 'USER_CANCELLED') {
          setError(result.message);
        }
      }
    } catch (err: any) {
      setError(t('errorPaymentFailed'));
    } finally {
      setIsPurchasing(false);
    }
  };

  // Map backend plan data to component props
  const mapPlanToCardProps = (plan: WalletCoinPlan) => {
    const bonusPercent = plan.bonusPercentage;
    let bonus = '';
    if (bonusPercent > 0) {
      bonus = t('bonusText', { percent: Math.round(bonusPercent) });
    }

    return {
      id: plan._id,
      tier: plan.tier,
      price: plan.priceInINR,
      coins: plan.totalCoins,
      bonus: bonus || undefined,
      badge: plan.badge === 'BEST_VALUE' ? 'BEST VALUE' : (plan.badge || undefined),
      isPopular: plan.badge === 'POPULAR',
      isBestValue: plan.badge === 'BEST_VALUE',
    };
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      {/* Top Navbar */}
      <MaleTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <MaleSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      {/* Top App Bar */}
      <CoinPurchaseHeader onHistoryClick={handleHistoryClick} />

      <div className="max-w-md mx-auto w-full flex flex-col gap-6 p-4">
        {/* Current Balance */}
        <BalanceDisplay balance={balance} />

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">
            <MaterialSymbol name="check_circle" className="text-green-500" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
            <MaterialSymbol name="error" className="text-red-500" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Promo Banner */}
        <PromoBanner
          title={t('promoTitle')}
          badge={t('limitedOffer')}
        />

        {/* Pricing Cards Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{t('selectPlan')}</h3>
            <span className="text-xs font-medium text-slate-500 dark:text-white/50">
              {t('pricesInInr')}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : coinPlans.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {coinPlans.map((plan) => {
                const cardProps = mapPlanToCardProps(plan);
                return (
                  <CoinPlanCard
                    key={plan._id}
                    tier={cardProps.tier}
                    price={cardProps.price}
                    coins={cardProps.coins}
                    bonus={cardProps.bonus}
                    badge={cardProps.badge}
                    isPopular={cardProps.isPopular}
                    isBestValue={cardProps.isBestValue}
                    onBuyClick={() => handleBuyClick(plan._id)}
                    disabled={isPurchasing}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MaterialSymbol name="monetization_on" size={48} className="mx-auto mb-2 opacity-50" />
              <p>{t('noPlansAvailable')}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-primary font-medium hover:underline"
              >
                {t('retry')}
              </button>
            </div>
          )}
        </div>

        {/* Trust Footer */}
        <TrustFooter />
      </div>

      {/* Loading Overlay */}
      {isPurchasing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">{t('processingPayment')}</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {/* Membership Upgrade Celebration Modal */}
      <MembershipUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        newTier={upgradeTier}
        previousTier={previousTier}
      />
    </div>
  );
};

