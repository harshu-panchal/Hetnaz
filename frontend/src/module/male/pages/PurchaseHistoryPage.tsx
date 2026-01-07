import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoinPurchaseHeader } from '../components/CoinPurchaseHeader';
import { SegmentedControls } from '../components/SegmentedControls';
import { TransactionItem } from '../components/TransactionItem';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import walletService from '../../../core/services/wallet.service';
import type { Transaction } from '../types/male.types';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const PurchaseHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // No sidebar needed anymore

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
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      <MaleTopNavbar />

      <CoinPurchaseHeader onHistoryClick={() => navigate('/male/buy-coins')} />

      <div className="max-w-md mx-auto w-full flex flex-col p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">{t('purchaseHistoryTitle')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('viewPurchaseHistory')}
          </p>
        </div>

        <div className="mb-4">
          <SegmentedControls
            options={filterOptions}
            selectedOption={selectedFilter}
            onOptionChange={setSelectedFilter}
          />
        </div>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MaterialSymbol
                name="history"
                size={48}
                className="text-gray-400 dark:text-gray-600 mb-4"
              />
              <p className="text-gray-500 dark:text-[#cc8ea3] text-center">
                {t('noPurchaseHistory')}
              </p>
              <button
                onClick={() => navigate('/male/buy-coins')}
                className="mt-4 px-6 py-2 bg-primary text-[#231d10] font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                {t('buyCoins')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
