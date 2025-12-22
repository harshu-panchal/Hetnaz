import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletHeader } from '../components/WalletHeader';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { SegmentedControls } from '../components/SegmentedControls';
import { TransactionItem } from '../components/TransactionItem';
import { BottomNavigation } from '../components/BottomNavigation';
import { HelpModal } from '../components/HelpModal';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import walletService from '../../../core/services/wallet.service';
import type { Transaction } from '../types/male.types';

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'purchased', label: 'Purchased' },
];

// Helper to format timestamp
const formatTransactionTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

export const WalletPage = () => {
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const { coinBalance, user, refreshBalance } = useGlobalState();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Refresh balance on page load
    refreshBalance();
  }, [refreshBalance]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Fetch real transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoadingTransactions(true);
        const data = await walletService.getMyTransactions({ limit: 10 });

        // Transform backend transactions to frontend format
        // Filter out message_spent transactions (user doesn't want these)
        const formattedTransactions: Transaction[] = (data.transactions || [])
          .filter((t: any) => t.direction === 'credit')
          .slice(0, 5)
          .map((t: any) => ({
            id: t._id,
            type: t.type === 'purchase' ? 'purchase' : t.type === 'gift_sent' ? 'gift' : 'spent',
            title: getTransactionTitle(t),
            timestamp: formatTransactionTime(t.createdAt),
            amount: t.amountCoins || 0, // Backend uses amountCoins, not amount
            isPositive: t.direction === 'credit',
          }));

        setTransactions(formattedTransactions);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, []);

  // Helper to generate transaction title
  const getTransactionTitle = (t: any): string => {
    // Get the related user's name from relatedUserId (populated by backend)
    const userName = t.relatedUserId?.profile?.name || 'User';

    switch (t.type) {
      case 'purchase':
        // Try to get plan name from coinPlanId
        const planName = t.coinPlanId?.name || '';
        return planName ? `Purchase of ${t.amountCoins} coins (${planName})` : `Coins Purchased`;
      case 'gift_sent':
        return `Gift sent to ${userName}`;
      case 'gift_received':
        return `Gift received from ${userName}`;
      case 'bonus':
        return t.description || 'Bonus Received';
      case 'refund':
        return 'Refund';
      default:
        return t.description || 'Transaction';
    }
  };

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'all') {
      return transactions;
    }
    if (selectedFilter === 'purchased') {
      return transactions.filter((t) => t.isPositive);
    }
    if (selectedFilter === 'spent') {
      return transactions.filter((t) => !t.isPositive);
    }
    return transactions;
  }, [selectedFilter, transactions]);

  const handleBuyCoins = () => {
    navigate('/male/buy-coins');
  };

  const handleHelpClick = () => {
    setIsHelpOpen(true);
  };

  // Get user avatar
  const userAvatar = user?.profile?.photos?.[0]?.url || '';

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto shadow-xl bg-background-light dark:bg-background-dark pb-20">
      {/* Top App Bar */}
      <WalletHeader onHelpClick={handleHelpClick} />

      {/* Profile / Balance Header */}
      <div className="flex p-4 flex-col gap-6 items-center">
        {/* Hero Card */}
        <WalletBalanceCard
          balance={coinBalance || 0}
          memberTier="Member"
          userAvatar={userAvatar}
        />

        {/* Primary Action */}
        <div className="w-full">
          <button
            onClick={handleBuyCoins}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-primary hover:bg-primary/90 transition-colors text-[#231d10] gap-2 text-lg font-bold shadow-lg shadow-primary/20 active:scale-95"
          >
            <MaterialSymbol name="add_circle" size={24} />
            <span>Buy Coins</span>
          </button>
        </div>
      </div>

      <div className="h-2 bg-transparent" />

      {/* Transaction History Header */}
      <div className="px-4">
        <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-3">
          Transaction History
        </h3>
      </div>

      {/* Segmented Controls */}
      <div className="px-4 pb-4">
        <SegmentedControls
          options={filterOptions}
          selectedOption={selectedFilter}
          onOptionChange={setSelectedFilter}
        />
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
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MaterialSymbol
              name="history"
              size={48}
              className="text-gray-400 dark:text-gray-600 mb-4"
            />
            <p className="text-gray-500 dark:text-[#cc8ea3] text-center">
              No transactions yet
            </p>
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
