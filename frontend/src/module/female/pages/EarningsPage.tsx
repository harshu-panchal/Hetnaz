import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import walletService from '../../../core/services/wallet.service';
import type { Transaction } from '../../../core/types/wallet.types';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { MeshBackground } from '../../../shared/components/auth/AuthLayoutComponents';

export const EarningsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();

  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleEarningsCount, setVisibleEarningsCount] = useState(10);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryData, txData] = await Promise.all([
        walletService.getEarningsSummary().catch(() => null),
        walletService.getMyTransactions({ direction: 'credit', limit: 50 }).catch(() => ({ transactions: [] })),
      ]);

      if (summaryData) {
        setSummary(summaryData);
        setBalance(summaryData.availableBalance || 0);
      }
      setTransactions(txData.transactions || []);
    } catch (err: any) {
      console.error('Failed to fetch earnings data:', err);
      setError(t('errorLoadEarnings')); // Fallback to a generic error message if specific one not found
    } finally {
      setIsLoading(false);
    }
  };

  // Get total earnings based on selected period
  const displayTotalEarnings = summary
    ? selectedPeriod === 'daily'
      ? summary.periodStats.daily
      : selectedPeriod === 'weekly'
        ? summary.periodStats.weekly
        : summary.periodStats.monthly
    : 0;

  // Get earnings breakdown by type
  const earningsByType = summary?.earningsByType || {};

  // Get icon for transaction type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message_earned':
        return 'mail';
      case 'video_call_earned':
        return 'videocam';
      case 'gift_received':
        return 'redeem';
      default:
        return 'monetization_on';
    }
  };

  // Format transaction type for display
  const formatType = (type: string) => {
    switch (type) {
      case 'message_earned':
        return t('typeMessage');
      case 'video_call_earned':
        return t('typeVideoCall');
      case 'gift_received':
        return t('typeGift');
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  // Filter earnings transactions
  const earningsTransactions = transactions.filter((t) => t.direction === 'credit' && t.type !== 'purchase');
  const hasMoreEarnings = earningsTransactions.length > visibleEarningsCount;

  return (
    <div className="font-display text-slate-900 dark:text-white antialiased selection:bg-pink-500 selection:text-white min-h-screen relative overflow-hidden flex flex-col bg-background-light dark:bg-[#0a0a0a] pb-24">
      <MeshBackground />
      
      <header className="relative z-20 flex items-center justify-between px-6 pb-6 pt-12 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-b border-white/20 dark:border-white/5 shadow-sm">
        <div className="space-y-0.5">
          <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 leading-none">{t('finance')}</h1>
          <h2 className="text-2xl font-black tracking-tight dark:text-white">{t('earnings')}</h2>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 space-y-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <div className="size-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('syncingWallet')}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="skeuo-card bg-red-500/5 border-red-500/20 p-6 rounded-[2rem] text-center space-y-2">
            <MaterialSymbol name="error" className="text-red-500" size={32} />
            <p className="text-xs font-bold text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Earnings Vault Summary */}
            <div className="group relative overflow-hidden skeuo-card bg-mesh-glass rounded-[2.5rem] p-8 border-white/60 dark:border-white/10 shadow-2xl transition-all hover:translate-y-[-2px]">
               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
               <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="skeuo-inset size-12 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500">
                       <MaterialSymbol name="account_balance_wallet" size={28} filled />
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">{t('totalEarnings')}</span>
                       <div className="flex items-center gap-2">
                          <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                            {displayTotalEarnings.toLocaleString()}
                          </p>
                          <MaterialSymbol name="monetization_on" className="text-amber-500 text-xl" filled />
                       </div>
                    </div>
                  </div>
                  
                  <div className="skeuo-inset bg-black/5 dark:bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/5 mb-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t('availableToWithdraw')}</span>
                     <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">₹{balance.toLocaleString()}</p>
                  </div>

                  <button
                    onClick={() => navigate('/female/withdrawal')}
                    className="skeuo-button w-full h-14 rounded-2xl bg-amber-500 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <MaterialSymbol name="payments" size={20} filled />
                    {t('withdrawFunds') || t('withdraw')}
                  </button>
               </div>
            </div>

            {/* Stats Grid - Skeuomorphic Insets */}
            <div className="grid grid-cols-3 gap-4">
               {Object.entries(earningsByType).map(([type, amount]) => (
                 <div key={type} className="skeuo-inset bg-white/40 dark:bg-black/40 rounded-[2rem] p-4 flex flex-col items-center gap-3 border border-white/20">
                    <div className="skeuo-card size-10 rounded-xl flex items-center justify-center bg-white/80 dark:bg-white/5 text-pink-500 shadow-sm">
                       <MaterialSymbol name={getTypeIcon(type)} size={22} filled />
                    </div>
                    <div className="space-y-0.5 text-center">
                       <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{amount as number}</p>
                       <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{formatType(type)}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Period Selector Tabs */}
            <div className="skeuo-inset bg-gray-50/50 dark:bg-black/40 rounded-2xl p-1.5 flex gap-1 relative overflow-hidden">
                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${
                      selectedPeriod === period ? 'skeuo-button bg-amber-500 text-white shadow-amber-500/20' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {t(period)}
                  </button>
                ))}
            </div>

            {/* Recent History */}
            <div className="space-y-6">
               <div className="flex items-center gap-3 px-1">
                  <div className="skeuo-inset size-8 rounded-xl flex items-center justify-center bg-gray-50/50 dark:bg-black/20">
                    <MaterialSymbol name="history" size={18} className="text-amber-500" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">{t('recentEarnings')}</h3>
               </div>

               <div className="skeuo-card rounded-[2.5rem] overflow-hidden bg-white/20 dark:bg-black/10 shadow-xl border-white/60 dark:border-white/5 divide-y divide-white/10">
                  {earningsTransactions.length === 0 ? (
                    <div className="py-20 text-center space-y-4 opacity-40">
                      <MaterialSymbol name="wallet" size={48} className="text-slate-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('noEarningsYet')}</p>
                    </div>
                  ) : (
                    <>
                      {earningsTransactions.slice(0, visibleEarningsCount).map((tx) => (
                        <div key={tx._id} className="flex items-center justify-between p-6 group transition-colors hover:bg-white/10">
                           <div className="flex items-center gap-4">
                              <div className="skeuo-inset size-12 rounded-2xl flex items-center justify-center bg-emerald-500/5 text-emerald-500">
                                 <MaterialSymbol name={getTypeIcon(tx.type)} size={24} filled />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-sm font-black text-slate-900 dark:text-white">{formatType(tx.type)}</p>
                                 <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                   {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                 </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-black text-emerald-500 tracking-tight">+{tx.amountCoins}</p>
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">COINS</p>
                           </div>
                        </div>
                      ))}
                      
                      {hasMoreEarnings && (
                        <button
                          onClick={() => setVisibleEarningsCount(prev => prev + 10)}
                          className="w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          {t('showMoreHistory')}
                          <MaterialSymbol name="expand_more" size={16} />
                        </button>
                      )}
                    </>
                  )}
               </div>
            </div>
          </>
        )}
      </main>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};
