import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { CoinPlan } from '../types/male.types';

// Mock data - replace with actual API calls
const mockCoinPlans: Record<string, CoinPlan> = {
  '1': {
    id: '1',
    tier: 'basic',
    price: 99,
    coins: 100,
  },
  '2': {
    id: '2',
    tier: 'silver',
    price: 299,
    coins: 330,
    bonus: '+10% Extra',
  },
  '3': {
    id: '3',
    tier: 'gold',
    price: 499,
    originalPrice: 550,
    coins: 600,
    bonus: '+20% Bonus',
    badge: 'POPULAR',
    isPopular: true,
  },
  '4': {
    id: '4',
    tier: 'platinum',
    price: 999,
    coins: 1500,
    bonus: '+50% Bonus',
    badge: 'BEST VALUE',
    isBestValue: true,
  },
};

export const PaymentPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [planId]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>(
    'idle'
  );

  const plan = planId ? mockCoinPlans[planId] : null;

  useEffect(() => {
    if (!plan) {
      navigate('/male/buy-coins');
    }
  }, [plan, navigate]);

  const handlePayment = async () => {
    if (!plan) return;

    setIsProcessing(true);
    setPaymentStatus('processing');

    // TODO: Integrate with Razorpay
    // This is a mock implementation
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus('success');

      // Redirect to wallet after 2 seconds
      setTimeout(() => {
        navigate('/male/wallet');
      }, 2000);
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/male/buy-coins');
  };

  if (!plan) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-gray-500';
      case 'silver':
        return 'bg-gray-400';
      case 'gold':
        return 'bg-primary';
      case 'platinum':
        return 'bg-purple-500';
      default:
        return 'bg-primary';
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mx-auto mb-4">
              <MaterialSymbol name="check_circle" size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {plan.coins} coins have been added to your wallet
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to wallet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white min-h-screen pb-24">
      {/* Top Navbar */}
      <MaleTopNavbar />

      {/* Header */}
      <header className="sticky top-[57px] z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleCancel}
            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
            aria-label="Go back"
            disabled={isProcessing}
          >
            <MaterialSymbol name="arrow_back" size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Payment</h1>
          <div className="size-10" /> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-md mx-auto w-full flex flex-col gap-6 p-4">
        {/* Plan Summary */}
        <div className="bg-white dark:bg-[#342d18] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`flex items-center justify-center w-16 h-16 rounded-full ${getTierColor(
                plan.tier
              )} text-white`}
            >
              <MaterialSymbol name="monetization_on" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold capitalize">{plan.tier} Plan</h2>
              {plan.badge && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded">
                  {plan.badge}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Coins</span>
              <span className="text-lg font-bold">{plan.coins.toLocaleString()}</span>
            </div>
            {plan.bonus && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Bonus</span>
                <span className="text-sm font-medium text-primary">{plan.bonus}</span>
              </div>
            )}
            {plan.originalPrice && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Original Price</span>
                <span className="text-sm line-through text-gray-400">
                  ₹{plan.originalPrice}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">₹{plan.price}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-[#342d18] rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
              <span className="font-medium">Razorpay</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Secure Payment</span>
              <MaterialSymbol name="lock" size={16} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full h-14 bg-primary text-[#231d10] font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-[#231d10] border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <MaterialSymbol name="payments" size={24} />
              <span>Pay ₹{plan.price}</span>
            </>
          )}
        </button>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className="w-full h-12 bg-gray-100 dark:bg-[#2f151e] text-slate-700 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-[#342d18] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        {/* Security Note */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Your payment is secured by Razorpay. We never store your card details.
        </p>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};



