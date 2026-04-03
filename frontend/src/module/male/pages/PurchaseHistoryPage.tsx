import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionItem } from '../components/TransactionItem';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import walletService from '../../../core/services/wallet.service';
import type { Transaction } from '../types/male.types';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const PurchaseHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [purchaseHistory, setPurchaseHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = useMemo(() => [
    { id: 'all', label: t('filterAll') },
    { id: 'recent', label: t('filterRecent') },
    { id: 'this_month', label: t('filterThisMonth') },
  ], [t]);

  // Helper to format timestamp
  const formatTransactionTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    if (diffDays === 0) {
      return `${t('today')}, ${timeStr}`;
    } else if (diffDays === 1) {
      return `${t('yesterday')}, ${timeStr}`;
    } else if (diffDays < 7) {
      return t('daysAgo', { count: diffDays });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPurchaseHistory();
  }, []);

  const fetchPurchaseHistory = async () => {
    try {
      setIsLoading(true);
      const data = await walletService.getMyTransactions({ type: 'purchase', limit: 20 });

      const formattedTransactions: Transaction[] = (data.transactions || []).map((tData: any) => {
        const planName = tData.coinPlanId?.name || tData.coinPlanId?.tier || '';
        const title = planName
          ? t('purchaseOf', { count: tData.amountCoins || 0, plan: planName })
          : t('coinsPurchased');

        return {
          id: tData._id,
          type: 'purchase',
          title,
          timestamp: formatTransactionTime(tData.createdAt),
          amount: tData.amountCoins || 0,
          isPositive: true,
        };
      });

      setPurchaseHistory(formattedTransactions);
    } catch (err) {
      console.error('Failed to fetch purchase history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    let filtered = purchaseHistory;

    switch (selectedFilter) {
      case 'recent':
        filtered = filtered.slice(0, 3);
        break;
      case 'this_month':
        filtered = filtered.slice(0, 10);
        break;
      default:
        break;
    }

    return filtered;
  }, [selectedFilter, purchaseHistory]);

  return (
    <div className="bg-[#fffcfd] dark:bg-[#0a0a0a] min-h-screen pb-32 relative overflow-hidden font-display antialiased">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-[#FFD93D]/5 blur-[100px] rounded-full animate-blob-shift" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-[#FF4D6D]/5 blur-[100px] rounded-full animate-blob-shift" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Header Removed for Immersive View */}


      <div className="max-w-md mx-auto w-full flex flex-col relative z-10 px-4 pt-6">
        {/* Title & Description */}
        <div className="mb-8 space-y-1">
          <h2 className="text-[10px] font-black uppercase tracking-[.3em] text-primary opacity-60 px-1">{t('COIN TRACKER')}</h2>
          <p className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest px-1">
            {t('Complete record of your purchases')}
          </p>
        </div>

        {/* Custom Segmented Control */}
        <div className="mb-8">
           <div className="skeuo-inset bg-gray-50 dark:bg-black/40 rounded-[1.5rem] p-1.5 flex gap-1">
            {filterOptions.map((filter) => {
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex-1 h-10 rounded-xl flex items-center justify-center transition-all duration-300 capitalize text-xs tracking-bold ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 font-black scale-[1.02]'
                    : 'text-slate-500 dark:text-slate-400 font-bold hover:text-primary transition-colors'
                    }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 skeuo-card rounded-[2.5rem] bg-mesh-glass border border-white/60 dark:border-white/10 overflow-hidden">
               <div className="absolute inset-0 bg-primary/5 animate-pulse" />
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin relative z-10" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-4 relative z-10">{t('Syncing Records...')}</p>
            </div>
          ) : filteredHistory.length > 0 ? (
            filteredHistory.map((transaction) => (
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
            /* Cinematic Empty State "The Archive" */
            <div className="flex flex-col items-center justify-center px-4 py-16">
               <div className="skeuo-card bg-mesh-glass rounded-[2.5rem] p-10 w-full flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-xl border border-white/60 dark:border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-[#FFD93D]/5 to-transparent pointer-events-none" />
                
                <div className="relative size-24 skeuo-inset rounded-full flex items-center justify-center bg-gray-50 dark:bg-black/40 mb-8 animate-pulse-slow">
                   <div className="absolute inset-2 bg-[#FFD93D]/20 blur-[15px] rounded-full" />
                   <MaterialSymbol name="history" size={48} className="text-[#FFD93D] drop-shadow-[0_4px_10px_rgba(255,217,61,0.3)]" filled />
                </div>
                
                <h2 className="relative z-10 text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-2">
                  {t('No Records')}
                </h2>
                <p className="relative z-10 text-[10px] font-bold text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed uppercase tracking-widest">
                  {t('Your coin purchase history will appear here once you make your first addition.')}
                </p>

                <button
                  onClick={() => navigate('/male/buy-coins')}
                  className="relative z-10 mt-10 skeuo-button-bold px-8 h-12 rounded-[1.25rem] flex items-center justify-center gap-2 transition-all active:scale-95 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-rose-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <MaterialSymbol name="add_circle" size={20} className="text-white relative z-10" filled />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white relative z-10">{t('Buy First Pack')}</span>
                </button>
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD93D]/20 to-transparent" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
