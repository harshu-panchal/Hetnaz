import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { WalletBalanceCard } from "../components/WalletBalanceCard";
import { TransactionItem } from "../components/TransactionItem";
import { HelpModal } from "../components/HelpModal";
import { useGlobalState } from "../../../core/context/GlobalStateContext";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import walletService from "../../../core/services/wallet.service";
import type { Transaction } from "../types/male.types";
import type { CoinPlan } from "../../../core/types/wallet.types";
import { useTranslation } from "../../../core/hooks/useTranslation";

export const WalletPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { coinBalance, user, refreshBalance } = useGlobalState();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [popularPlans, setPopularPlans] = useState<CoinPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Helper to format timestamp
  const formatTransactionTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffDays === 0) {
      return `${t("today", { defaultValue: "Today" })}, ${timeStr}`;
    } else if (diffDays === 1) {
      return `${t("yesterday", { defaultValue: "Yesterday" })}, ${timeStr}`;
    } else if (diffDays < 7) {
      return t("daysAgo", { count: diffDays, defaultValue: `${diffDays}d ago` });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Helper to generate transaction title
  const getTransactionTitle = (tData: any): string => {
    const userName = tData.relatedUserId?.profile?.name || "User";

    switch (tData.type) {
      case "purchase": {
        const planName = tData.coinPlanId?.name || "";
        return planName
          ? t("purchaseOf", { count: tData.amountCoins, plan: planName, defaultValue: `${planName} Plan` })
          : t("coinsPurchased", { defaultValue: "Coins Purchased" });
      }
      case "gift_sent":
        return t("giftSentTo", { name: userName, defaultValue: `Gift sent to ${userName}` });
      case "gift_received":
        return t("giftReceivedFrom", { name: userName, defaultValue: `Gift from ${userName}` });
      case "bonus":
        return tData.description || t("bonus", { defaultValue: "Bonus Received" });
      case "refund":
        return t("refund", { defaultValue: "Refund" });
      default:
        return tData.description || t("transaction", { defaultValue: "Transaction" });
    }
  };

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        refreshBalance(),
        fetchTransactions(1, false),
      ]);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    refreshBalance();
    fetchPopularPlans();
    fetchTransactions(1, false);
  }, []);

  const fetchPopularPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const plans = await walletService.getCoinPlans();
      if (Array.isArray(plans)) {
        // Sort lowest price first and take top 3
        const sorted = [...plans].sort(
          (a: any, b: any) => (a.priceInINR || 0) - (b.priceInINR || 0)
        );
        setPopularPlans(sorted.slice(0, 3));
      }
    } catch (err) {
      console.error("Failed to fetch coin plans:", err);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 10;

  const fetchTransactions = async (page: number, append: boolean) => {
    try {
      if (append) setIsLoadingMore(true);
      else setIsLoadingTransactions(true);

      const data = await walletService.getMyTransactions({
        limit: ITEMS_PER_PAGE,
        page,
        type: "purchase", // Purchases view
      });

      const formattedTransactions: Transaction[] = (
        data.transactions || []
      ).map((tra: any) => ({
        id: tra._id,
        type: "purchase" as const,
        title: getTransactionTitle(tra),
        timestamp: formatTransactionTime(tra.createdAt),
        amount: tra.amountCoins || 0,
        isPositive: true,
      }));

      if (append) {
        setTransactions((prev) => [...prev, ...formattedTransactions]);
      } else {
        setTransactions(formattedTransactions);
      }

      setHasMore(formattedTransactions.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setIsLoadingTransactions(false);
      setIsLoadingMore(false);
    }
  };

  const handleShowMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchTransactions(nextPage, true);
  };

  const handleBuyCoins = () => {
    navigate("/male/buy-coins");
  };

  // Get user avatar
  const userAvatar = user?.photos?.[0] || "";

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light pb-24 font-display text-ink antialiased">
      {/* Sticky Top Brand Header (Cohesive with Discover & Chat) */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-b border-pink-100/40 dark:border-slate-800/80 shadow-xs py-2.5 px-4">
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-2xl tracking-tight uppercase bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent drop-shadow-xs">
              {t("wallet", { defaultValue: "WALLET" })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-10 w-10 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 shadow-xs group"
              aria-label="Refresh Balance"
              title="Refresh Balance"
            >
              <MaterialSymbol
                name="sync"
                size={20}
                className={`text-slate-600 dark:text-slate-400 group-hover:text-pink-600 transition-colors ${
                  isRefreshing ? "animate-spin text-pink-600" : ""
                }`}
              />
            </button>

            {/* Help / Support Modal Trigger */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="h-10 w-10 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 shadow-xs group"
              aria-label="Wallet Help"
              title="Wallet Help"
            >
              <MaterialSymbol
                name="help_outline"
                size={20}
                className="text-slate-600 dark:text-slate-400 group-hover:text-pink-600 transition-colors"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full flex flex-col px-4 pt-4 gap-5">
        {/* Hero Balance Card */}
        <WalletBalanceCard
          balance={coinBalance || 0}
          memberTier={user?.memberTier}
          userAvatar={userAvatar}
          userName={user?.name || "Member"}
          onAddCoins={handleBuyCoins}
        />

        {/* Primary Recharge Button */}
        <button
          onClick={handleBuyCoins}
          className="flex w-full cursor-pointer items-center justify-between px-5 h-14 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 active:scale-98 transition-all text-white font-black shadow-lg shadow-pink-500/25 group"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-xs">
              <MaterialSymbol name="add_circle" size={22} className="text-white" filled />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-black leading-tight tracking-tight">
                {t("buyCoins", { defaultValue: "Buy Coins" })}
              </span>
              <span className="text-[11px] font-semibold text-white/85 leading-tight">
                Instant credit • Exclusive bonuses
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/95 text-xs sm:text-sm font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            <span>Recharge</span>
            <MaterialSymbol name="arrow_forward" size={18} />
          </div>
        </button>

        {/* Popular Coin Packs Quick Preview ("and also") */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
                <MaterialSymbol name="local_fire_department" size={16} filled />
              </div>
              <h3 className="text-slate-900 dark:text-white text-base font-black tracking-tight">
                {t("popularPacks", { defaultValue: "Popular Packages" })}
              </h3>
            </div>
            <button
              onClick={handleBuyCoins}
              className="text-xs font-black text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-0.5"
            >
              <span>{t("viewAll", { defaultValue: "View All" })}</span>
              <MaterialSymbol name="chevron_right" size={16} />
            </button>
          </div>

          {isLoadingPlans ? (
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 animate-pulse p-3 flex flex-col justify-between"
                >
                  <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded-md" />
                  <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
                  <div className="h-6 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
              ))}
            </div>
          ) : popularPlans.length > 0 ? (
            <div className="grid grid-cols-3 gap-2.5">
              {popularPlans.map((plan: any, idx: number) => {
                const bonusPercent = plan.bonusPercentage || 0;
                const isHighlight = idx === 1; // Highlight the middle package
                return (
                  <div
                    key={plan._id || idx}
                    onClick={handleBuyCoins}
                    className={`relative rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-95 border ${
                      isHighlight
                        ? "bg-gradient-to-b from-pink-50/80 to-rose-50/40 dark:from-pink-950/20 dark:to-rose-950/10 border-pink-300 dark:border-pink-800/60 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs"
                    }`}
                  >
                    {/* Badge */}
                    {bonusPercent > 0 ? (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs whitespace-nowrap">
                        +{Math.round(bonusPercent)}% FREE
                      </span>
                    ) : isHighlight ? (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs whitespace-nowrap">
                        POPULAR
                      </span>
                    ) : null}

                    {/* Coins */}
                    <div className="flex flex-col items-center text-center mt-1">
                      <div className="flex items-center gap-1">
                        <MaterialSymbol name="monetization_on" size={16} filled className="text-amber-500" />
                        <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                          {(plan.totalCoins || plan.amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Coins
                      </span>
                    </div>

                    {/* Price Button */}
                    <div className="mt-2.5">
                      <div
                        className={`w-full py-1.5 rounded-xl text-xs font-black text-center transition-colors ${
                          isHighlight
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs shadow-pink-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        ₹{plan.priceInINR || plan.price || 0}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Security & Benefits Trust Highlights */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs">
            <MaterialSymbol name="bolt" size={18} className="text-amber-500 shrink-0" filled />
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-tight">Instant</span>
              <span className="text-[9px] font-medium text-slate-400 leading-tight">Auto Credited</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs">
            <MaterialSymbol name="verified_user" size={18} className="text-emerald-500 shrink-0" filled />
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-tight">100% Safe</span>
              <span className="text-[9px] font-medium text-slate-400 leading-tight">UPI & Cards</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs">
            <MaterialSymbol name="support_agent" size={18} className="text-blue-500 shrink-0" filled />
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-tight">24/7 Help</span>
              <span className="text-[9px] font-medium text-slate-400 leading-tight">Instant Support</span>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="flex flex-col mt-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
                <MaterialSymbol name="receipt_long" size={16} filled />
              </div>
              <h3 className="text-slate-900 dark:text-white text-base font-black tracking-tight">
                {t("transactionHistory", { defaultValue: "Transaction History" })}
              </h3>
            </div>
            {transactions.length > 0 && (
              <span className="text-xs font-bold text-slate-400">
                {transactions.length} {t("records", { defaultValue: "records" })}
              </span>
            )}
          </div>

          {/* Transaction List */}
          <div className="flex flex-col pt-3">
            {isLoadingTransactions ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 flex items-center justify-between border border-slate-100 dark:border-slate-800 animate-pulse shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  id={transaction.id}
                  type={transaction.type}
                  title={transaction.title}
                  timestamp={transaction.timestamp}
                  amount={transaction.amount}
                  isPositive={transaction.isPositive}
                />
              ))
            ) : (
              /* Redesigned Modern Empty State */
              <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center my-2 shadow-xs">
                <div className="size-16 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center mb-3.5 shadow-xs">
                  <MaterialSymbol
                    name="savings"
                    size={32}
                    className="text-amber-500"
                    filled
                  />
                </div>
                <h4 className="text-slate-900 dark:text-white font-black text-base tracking-tight mb-1">
                  {t("noPurchaseHistory", { defaultValue: "No Purchases Yet" })}
                </h4>
                <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xs leading-relaxed mb-5">
                  Recharge coins to send virtual gifts, connect with verified profiles, and unlock exclusive features!
                </p>
                <button
                  onClick={handleBuyCoins}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <MaterialSymbol name="add" size={16} />
                  <span>{t("buyCoins", { defaultValue: "Buy Coins Now" })}</span>
                </button>
              </div>
            )}

            {/* Show More Button */}
            {hasMore && transactions.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={handleShowMore}
                  disabled={isLoadingMore}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-ink font-bold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors disabled:opacity-50 shadow-xs"
                >
                  {isLoadingMore ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MaterialSymbol name="expand_more" />
                      <span>{t("showMore", { defaultValue: "Show More" })}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
