import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoinPurchaseHeader } from '../components/CoinPurchaseHeader';
import { SegmentedControls } from '../components/SegmentedControls';
import { TransactionItem } from '../components/TransactionItem';
import { MaterialSymbol } from '../types/material-symbol';
import type { Transaction } from '../types/male.types';

// Mock data - replace with actual API calls
const mockPurchaseHistory: Transaction[] = [
  {
    id: '1',
    type: 'purchase',
    title: 'Gold Plan - 600 Coins',
    timestamp: 'Today, 10:23 AM',
    amount: 600,
    isPositive: true,
  },
  {
    id: '2',
    type: 'purchase',
    title: 'Silver Plan - 330 Coins',
    timestamp: 'Yesterday, 8:45 PM',
    amount: 330,
    isPositive: true,
  },
  {
    id: '3',
    type: 'purchase',
    title: 'Platinum Plan - 1500 Coins',
    timestamp: '3 days ago, 2:15 PM',
    amount: 1500,
    isPositive: true,
  },
  {
    id: '4',
    type: 'purchase',
    title: 'Basic Plan - 100 Coins',
    timestamp: '1 week ago, 11:30 AM',
    amount: 100,
    isPositive: true,
  },
  {
    id: '5',
    type: 'purchase',
    title: 'Gold Plan - 600 Coins',
    timestamp: '2 weeks ago, 4:20 PM',
    amount: 600,
    isPositive: true,
  },
];

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recent' },
  { id: 'this_month', label: 'This Month' },
];

export const PurchaseHistoryPage = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredHistory = useMemo(() => {
    let filtered = mockPurchaseHistory;

    switch (selectedFilter) {
      case 'recent':
        // Show last 7 days
        filtered = filtered.slice(0, 3);
        break;
      case 'this_month':
        // Show this month (mock: first 4)
        filtered = filtered.slice(0, 4);
        break;
      default:
        break;
    }

    return filtered;
  }, [selectedFilter]);

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      {/* Top App Bar */}
      <CoinPurchaseHeader onHistoryClick={() => navigate('/buy-coins')} />

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
          {filteredHistory.length > 0 ? (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


