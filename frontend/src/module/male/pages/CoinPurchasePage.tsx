import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../core/context/AuthContext";
import { useGlobalState } from "../../../core/context/GlobalStateContext";

import { BalanceDisplay } from "../components/BalanceDisplay";
import { PromoBanner } from "../components/PromoBanner";
import { CoinPlanCard } from "../components/CoinPlanCard";
import { TrustFooter } from "../components/TrustFooter";
import { MembershipUpgradeModal } from "../components/MembershipUpgradeModal";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import walletService from "../../../core/services/wallet.service";
import paymentService from "../../../core/services/payment.service";
import type { CoinPlan as WalletCoinPlan } from "../../../core/types/wallet.types";
import { useTranslation } from "../../../core/hooks/useTranslation";

export const CoinPurchasePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { user, updateUser } = useAuth();
  const { updateBalance } = useGlobalState();

  const [coinPlans, setCoinPlans] = useState<WalletCoinPlan[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Membership upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<
    "silver" | "gold" | "platinum"
  >("silver");
  const [previousTier, setPreviousTier] = useState<string>("basic");

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
      console.error("Failed to fetch data:", err);
      setError(
        t("errorLoadPlans", { defaultValue: "Failed to load coin packages" }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyClick = async (planId: string) => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await paymentService.initiatePayment(planId, {
        name: user?.name || "",
        phone: user?.phoneNumber || "",
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
          setPreviousTier(result.previousTier || "basic");
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
        if (result.error !== "USER_CANCELLED") {
          setError(result.message);
        }
      }
    } catch (err: any) {
      setError(
        t("errorPaymentFailed", {
          defaultValue: "Payment failed. Please try again.",
        }),
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  // Map backend plan data to component props
  const mapPlanToCardProps = (plan: WalletCoinPlan) => {
    const bonusPercent = plan.bonusPercentage;
    let bonus = "";
    if (bonusPercent > 0) {
      bonus = t("bonusText", {
        percent: Math.round(bonusPercent),
        defaultValue: `+${Math.round(bonusPercent)}% FREE`,
      });
    }

    return {
      id: plan._id,
      tier: plan.tier,
      price: plan.priceInINR,
      coins: plan.totalCoins,
      bonus: bonus || undefined,
      badge:
        plan.badge === "BEST_VALUE" ? "BEST VALUE" : plan.badge || undefined,
      isPopular: plan.badge === "POPULAR",
      isBestValue: plan.badge === "BEST_VALUE",
    };
  };

  return (
    <div className="font-display bg-background-light text-ink antialiased selection:bg-pink-600 selection:text-white pb-16 min-h-screen">
      {/* Sticky Top Header with Back Button */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-b border-pink-100/40 dark:border-slate-800/80 shadow-xs py-2.5 px-4">
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 shadow-xs group"
              aria-label="Back">
              <MaterialSymbol
                name="arrow_back"
                size={20}
                className="text-slate-700 dark:text-slate-300 group-hover:text-pink-600 transition-colors"
              />
            </button>
            <span className="font-black text-xl sm:text-2xl tracking-tight uppercase bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent drop-shadow-xs">
              {t("buyCoins", { defaultValue: "Buy Coins" })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 shadow-2xs">
              <MaterialSymbol
                name="monetization_on"
                filled
                size={16}
                className="text-amber-500"
              />
              <span className="font-mono text-xs font-black text-amber-700 dark:text-amber-300">
                {balance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full flex flex-col gap-5 p-4">
        {/* Current Balance */}
        <BalanceDisplay balance={balance} />

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="flex items-center gap-2 p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl shadow-xs">
            <MaterialSymbol
              name="check_circle"
              className="text-emerald-500"
              filled
            />
            <span className="text-xs font-bold">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl shadow-xs">
            <MaterialSymbol name="error" className="text-rose-500" filled />
            <span className="text-xs font-bold">{error}</span>
          </div>
        )}

        {/* Promo Banner */}
        <PromoBanner
          title={t("promoTitle", {
            defaultValue: "Get 50% extra on your first recharge!",
          })}
          badge={t("limitedOffer", { defaultValue: "LIMITED OFFER" })}
        />

        {/* Pricing Cards Section */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
                <MaterialSymbol name="diamond" size={16} filled />
              </div>
              <h3 className="text-slate-900 dark:text-white text-base font-black tracking-tight">
                {t("selectPlan", { defaultValue: "Select Coin Package" })}
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {t("pricesInInr", { defaultValue: "Prices in INR (₹)" })}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-56 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 animate-pulse p-4 flex flex-col justify-between">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto" />
                  <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto" />
                  <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto" />
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : coinPlans.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5">
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
              <MaterialSymbol
                name="monetization_on"
                size={48}
                className="mx-auto mb-2 text-pink-400 opacity-60"
              />
              <p className="text-slate-500 font-bold text-sm">
                {t("noPlansAvailable", {
                  defaultValue: "No packages available",
                })}
              </p>
              <button
                onClick={fetchData}
                className="mt-3 px-4 py-1.5 rounded-xl bg-pink-50 text-pink-600 font-bold text-xs hover:bg-pink-100 transition-colors">
                {t("retry", { defaultValue: "Retry" })}
              </button>
            </div>
          )}
        </div>

        {/* Trust Footer */}
        <TrustFooter />
      </div>

      {/* Loading Overlay */}
      {isPurchasing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 flex flex-col items-center gap-3 shadow-2xl border border-pink-100 dark:border-slate-800 max-w-xs mx-4">
            <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-900 dark:text-white text-sm font-bold text-center">
              {t("processingPayment", {
                defaultValue: "Processing Secure Payment...",
              })}
            </p>
          </div>
        </div>
      )}

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
