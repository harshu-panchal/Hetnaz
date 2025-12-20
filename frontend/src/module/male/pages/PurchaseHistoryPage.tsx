import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoinPurchaseHeader } from '../components/CoinPurchaseHeader';
import { SegmentedControls } from '../components/SegmentedControls';
import { TransactionItem } from '../components/TransactionItem';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { MaleSidebar } from '../components/MaleSidebar';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import walletService from '../../../core/services/wallet.service';
import type { Transaction } from '../types/male.types';

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recent' },
  { id: 'this_month', label: 'This Month' },
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

export const PurchaseHistoryPage = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useMaleNavigation();

  const [purchaseHistory, setPurchaseHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPurchaseHistory();
  }, []);

  const fetchPurchaseHistory = async () => {
    try {
      setIsLoading(true);
      // Fetch only purchase type transactions
      const data = await walletService.getMyTransactions({ type: 'purchase', limit: 20 });

      // Transform backend transactions to frontend format
      const formattedTransactions: Transaction[] = (data.transactions || []).map((t: any) => {
        // Get plan name from coinPlanId if populated
        const planName = t.coinPlanId?.name || t.coinPlanId?.tier || '';
        const title = planName
          ? `Purchase of ${t.amountCoins || 0} coins (${planName})`
          : t.description || `${t.amountCoins || 0} Coins Purchased`;

        return {
          id: t._id,
          type: 'purchase',
          title,
          timestamp: formatTransactionTime(t.createdAt),
          amount: t.amountCoins || 0, // Backend uses amountCoins, not amount
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
        // Show last 3
        filtered = filtered.slice(0, 3);
        break;
      case 'this_month':
        // Show this month (limit to 10)
        filtered = filtered.slice(0, 10);
        break;
      default:
        break;
    }

    return filtered;
  }, [selectedFilter, purchaseHistory]);

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
      <CoinPurchaseHeader onHistoryClick={() => navigate('/male/buy-coins')} />

      <div className="max-w-md mx-auto w-full flex flex-col p-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">Purchase History</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View all your coin purchase transactions
          </p>
        </div>

        {/* Segmented Controls */}
        <div className="mb-4">
          <SegmentedControls
            options={filterOptions}
            selectedOption={selectedFilter}
            onOptionChange={setSelectedFilter}
          />
        </div>

        {/* Transaction List */}
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
                No purchase history found
              </p>
              <button
                onClick={() => navigate('/male/buy-coins')}
                className="mt-4 px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Buy Coins
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
