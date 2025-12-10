import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoinPurchaseHeader } from '../components/CoinPurchaseHeader';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { PromoBanner } from '../components/PromoBanner';
import { CoinPlanCard } from '../components/CoinPlanCard';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';
import { TrustFooter } from '../components/TrustFooter';
import type { PaymentMethod } from '../components/PaymentMethodSelector';
import type { CoinPlan } from '../types/male.types';

// Mock data - replace with actual API calls
const coinPlans: CoinPlan[] = [
  {
    id: '1',
    tier: 'basic',
    price: 99,
    coins: 100,
  },
  {
    id: '2',
    tier: 'silver',
    price: 299,
    coins: 330,
    bonus: '+10% Extra',
  },
  {
    id: '3',
    tier: 'gold',
    price: 499,
    originalPrice: 550,
    coins: 600,
    bonus: '+20% Bonus',
    badge: 'POPULAR',
    isPopular: true,
  },
  {
    id: '4',
    tier: 'platinum',
    price: 999,
    coins: 1500,
    bonus: '+50% Bonus',
    badge: 'BEST VALUE',
    isBestValue: true,
  },
];

const paymentMethods = [
  {
    id: 'apple_pay' as PaymentMethod,
    name: 'Apple Pay',
    description: 'Default method',
    icon: 'Pay',
    iconBg: 'bg-black',
  },
  {
    id: 'card' as PaymentMethod,
    name: 'Credit / Debit Card',
  },
  {
    id: 'upi' as PaymentMethod,
    name: 'UPI Apps',
  },
];

export const CoinPurchasePage = () => {
  const navigate = useNavigate();
  const [balance] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('apple_pay');

  const handleHistoryClick = () => {
    navigate('/purchase-history');
  };

  const handleBuyClick = (planId: string) => {
    navigate(`/payment/${planId}`);
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      {/* Top App Bar */}
      <CoinPurchaseHeader onHistoryClick={handleHistoryClick} />

      <div className="max-w-md mx-auto w-full flex flex-col gap-6 p-4">
        {/* Current Balance */}
        <BalanceDisplay balance={balance} />

        {/* Promo Banner */}
        <PromoBanner
          title="Get 50% extra on your first purchase!"
          badge="Limited Offer"
        />

        {/* Pricing Cards Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Select Plan</h3>
            <span className="text-xs font-medium text-slate-500 dark:text-white/50">
              Prices in INR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {coinPlans.map((plan) => (
              <CoinPlanCard
                key={plan.id}
                tier={plan.tier}
                price={plan.price}
                coins={plan.coins}
                originalPrice={plan.originalPrice}
                bonus={plan.bonus}
                badge={plan.badge}
                isPopular={plan.isPopular}
                isBestValue={plan.isBestValue}
                onBuyClick={() => handleBuyClick(plan.id)}
              />
            ))}
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold">Payment Method</h3>
          <PaymentMethodSelector
            methods={paymentMethods}
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
          />
        </div>

        {/* Trust Footer */}
        <TrustFooter />
      </div>
    </div>
  );
};

