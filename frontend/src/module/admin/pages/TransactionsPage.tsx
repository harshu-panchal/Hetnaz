import { useState, useEffect, useMemo } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { TransactionTable } from '../components/TransactionTable';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { AdminTransaction } from '../types/admin.types';

// Mock data - replace with actual API calls
const mockTransactions: AdminTransaction[] = [
  {
    id: 'tx-1',
    userId: '1',
    userName: 'Alex Johnson',
    type: 'purchase',
    amountCoins: 1000,
    amountINR: 999,
    direction: 'credit',
    timestamp: new Date(Date.now() - 3600000),
    status: 'completed',
    relatedEntityId: 'payment-1',
  },
  {
    id: 'tx-2',
    userId: '2',
    userName: 'Sarah Lee',
    type: 'message_spent',
    amountCoins: 50,
    direction: 'debit',
    timestamp: new Date(Date.now() - 7200000),
    status: 'completed',
    relatedEntityId: 'chat-1',
  },
  {
    id: 'tx-3',
    userId: '2',
    userName: 'Sarah Lee',
    type: 'message_earned',
    amountCoins: 25,
    direction: 'credit',
    timestamp: new Date(Date.now() - 10800000),
    status: 'completed',
    relatedEntityId: 'chat-1',
  },
  {
    id: 'tx-4',
    userId: '3',
    userName: 'Emily White',
    type: 'withdrawal',
    amountCoins: 2000,
    amountINR: 1000,
    direction: 'debit',
    timestamp: new Date(Date.now() - 86400000),
    status: 'pending',
    relatedEntityId: 'withdrawal-1',
  },
  {
    id: 'tx-5',
    userId: '4',
    userName: 'Jessica Martinez',
    type: 'gift_sent',
    amountCoins: 100,
    direction: 'debit',
    timestamp: new Date(Date.now() - 172800000),
    status: 'completed',
    relatedEntityId: 'gift-1',
  },
  {
    id: 'tx-6',
    userId: '5',
    userName: 'David Brown',
    type: 'purchase',
    amountCoins: 500,
    amountINR: 499,
    direction: 'credit',
    timestamp: new Date(Date.now() - 259200000),
    status: 'completed',
    relatedEntityId: 'payment-2',
  },
  {
    id: 'tx-7',
    userId: '6',
    userName: 'Michael Chen',
    type: 'adjustment',
    amountCoins: 200,
    direction: 'credit',
    timestamp: new Date(Date.now() - 345600000),
    status: 'completed',
    relatedEntityId: 'adjustment-1',
  },
  {
    id: 'tx-8',
    userId: '1',
    userName: 'Alex Johnson',
    type: 'purchase',
    amountCoins: 500,
    amountINR: 499,
    direction: 'credit',
    timestamp: new Date(Date.now() - 432000000),
    status: 'failed',
    relatedEntityId: 'payment-3',
  },
];

export const TransactionsPage = () => {
  const [transactions] = useState<AdminTransaction[]>(mockTransactions);
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter((t) => t.status === 'completed').length;
    const pendingTransactions = transactions.filter((t) => t.status === 'pending').length;
    const failedTransactions = transactions.filter((t) => t.status === 'failed').length;
    const totalCredits = transactions
      .filter((t) => t.direction === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amountCoins, 0);
    const totalDebits = transactions
      .filter((t) => t.direction === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amountCoins, 0);
    const totalRevenue = transactions
      .filter((t) => t.type === 'purchase' && t.status === 'completed' && t.amountINR)
      .reduce((sum, t) => sum + (t.amountINR || 0), 0);

    return {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalCredits,
      totalDebits,
      totalRevenue,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = (transaction: AdminTransaction) => {
    // TODO: Open transaction details modal
    console.log('View transaction details:', transaction);
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
      {/* Top Navbar */}
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transactions</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor all platform transactions</p>
            </div>
            <button
              onClick={() => {
                // TODO: Implement export functionality
                console.log('Exporting transaction data...');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <MaterialSymbol name="download" size={20} />
              Export Data
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MaterialSymbol name="receipt_long" className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.completedTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MaterialSymbol name="check_circle" className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Credits</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.totalCredits.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">coins</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MaterialSymbol name="arrow_upward" className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <MaterialSymbol name="payments" className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {stats.pendingTransactions}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <MaterialSymbol name="pending" className="text-orange-600 dark:text-orange-400" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {stats.failedTransactions}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <MaterialSymbol name="error" className="text-red-600 dark:text-red-400" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <TransactionTable transactions={transactions} onViewDetails={handleViewDetails} />
        </div>
      </div>
    </div>
  );
};

