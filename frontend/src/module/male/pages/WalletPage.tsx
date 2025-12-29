import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletHeader } from '../components/WalletHeader';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { TransactionItem } from '../components/TransactionItem';
import { BottomNavigation } from '../components/BottomNavigation';
import { HelpModal } from '../components/HelpModal';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import walletService from '../../../core/services/wallet.service';
import type { Transaction } from '../types/male.types';
import { useTranslation } from '../../../core/hooks/useTranslation';

// No filter options as per user request to only show purchases

// Helper to format timestamp
export const WalletPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const { coinBalance, user, refreshBalance } = useGlobalState();

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

  // Helper to generate transaction title
  const getTransactionTitle = (tData: any): string => {
    const userName = tData.relatedUserId?.profile?.name || 'User';

    switch (tData.type) {
      case 'purchase':
        const planName = tData.coinPlanId?.name || '';
        return planName
          ? t('purchaseOf', { count: tData.amountCoins, plan: planName })
          : t('coinsPurchased');
      case 'gift_sent':
        return t('giftSentTo', { name: userName });
      case 'gift_received':
        return t('giftReceivedFrom', { name: userName });
      case 'bonus':
        return tData.description || t('bonus', { defaultValue: 'Bonus Received' });
      case 'refund':
        return t('refund', { defaultValue: 'Refund' });
      default:
        return tData.description || t('transaction', { defaultValue: 'Transaction' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // Refresh balance on page load
    refreshBalance();
  }, [refreshBalance]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 10;

  // Fetch real transactions
  useEffect(() => {
    fetchTransactions(1, false);
  }, []);

  const fetchTransactions = async (page: number, append: boolean) => {
    try {
      if (append) setIsLoadingMore(true);
      else setIsLoadingTransactions(true);

      const data = await walletService.getMyTransactions({
        limit: ITEMS_PER_PAGE,
        page,
        type: 'purchase' // Only show purchases as requested
      });

      // Transform backend transactions to frontend format
      const formattedTransactions: Transaction[] = (data.transactions || [])
        .map((tra: any) => ({
          id: tra._id,
          type: 'purchase' as const,
          title: getTransactionTitle(tra),
          timestamp: formatTransactionTime(tra.createdAt),
          amount: tra.amountCoins || 0,
          isPositive: true,
        }));

      if (append) {
        setTransactions(prev => [...prev, ...formattedTransactions]);
      } else {
        setTransactions(formattedTransactions);
      }

      setHasMore(formattedTransactions.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
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

  const filteredTransactions = transactions;

  const handleBuyCoins = () => {
    navigate('/male/buy-coins');
  };

  const handleHelpClick = () => {
    setIsHelpOpen(true);
  };

  // Get user avatar
  const userAvatar = user?.photos?.[0] || '';

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto shadow-xl bg-background-light dark:bg-background-dark pb-20 font-display">
      {/* Top App Bar */}
      <WalletHeader onHelpClick={handleHelpClick} />

      {/* Profile / Balance Header */}
      <div className="flex p-4 flex-col gap-6 items-center">
        {/* Hero Card */}
        <WalletBalanceCard
          balance={coinBalance || 0}
          memberTier={user?.memberTier}
          userAvatar={userAvatar}
        />

        {/* Primary Action */}
        <div className="w-full">
          <button
            onClick={handleBuyCoins}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-primary hover:bg-primary/90 transition-colors text-[#231d10] gap-2 text-lg font-bold shadow-lg shadow-primary/20 active:scale-95"
          >
            <MaterialSymbol name="add_circle" size={24} />
            <span>{t('buyCoins')}</span>
          </button>
        </div>
      </div>

      <div className="h-2 bg-transparent" />

      {/* Transaction History Header */}
      <div className="px-4">
        <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-3">
          {t('transactionHistory')}
        </h3>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col pb-24">
        {isLoadingTransactions ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
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
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MaterialSymbol
              name="history"
              size={48}
              className="text-gray-400 dark:text-gray-600 mb-4"
            />
            <p className="text-gray-500 dark:text-[#cc8ea3]">
              {t('noPurchaseHistory')}
            </p>
          </div>
        )}

        {/* Show More Button */}
        {hasMore && transactions.length > 0 && (
          <div className="px-4 mt-4">
            <button
              onClick={handleShowMore}
              disabled={isLoadingMore}
              className="flex w-full items-center justify-center gap-2 rounded-xl h-12 border border-gray-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <MaterialSymbol name="expand_more" />
                  <span>{t('showMore')}</span>
                </>
              )}
            </button>
          </div>
        )}
        <div className="h-4" />
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
