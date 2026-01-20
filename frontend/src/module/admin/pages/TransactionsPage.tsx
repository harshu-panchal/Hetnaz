import { useState, useEffect, useMemo } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { TransactionTable } from '../components/TransactionTable';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import adminService from '../../../core/services/admin.service';
import type { AdminTransaction } from '../types/admin.types';

// Mock data - replace with actual API calls
// const mockTransactions: AdminTransaction[] = [ ... ];

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all' });
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick, isCollapsed, toggleCollapse } = useAdminNavigation();

  // Transaction details modal state
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  console.log('TransactionsPage filters:', filters, 'page:', page, 'updateFilters:', updateFilters);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTransactions();
  }, [page, filters]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.listTransactions(filters, page, 20);
      setTransactions(data.transactions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setTotalRevenue(data.totalRevenue || 0);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

    return {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalCredits,
      totalDebits,
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
    setSelectedTransaction(transaction);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
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
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content */}
      <div className={`flex-1 p-4 md:p-6 mt-[57px] transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transactions</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor all platform transactions ({total} total)</p>
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
                    {formatCurrency(totalRevenue)}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <TransactionTable transactions={transactions} onViewDetails={handleViewDetails} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {/* Simplified pagination for now */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl max-w-lg w-full p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <MaterialSymbol name="close" size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction ID</p>
                    <p className="text-sm font-mono font-medium text-gray-900 dark:text-white break-all">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${selectedTransaction.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      selectedTransaction.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                      {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{selectedTransaction.userId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedTransaction.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount (Coins)</p>
                    <p className={`text-lg font-bold ${selectedTransaction.direction === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTransaction.direction === 'credit' ? '+' : '-'}{selectedTransaction.amountCoins.toLocaleString()}
                    </p>
                  </div>
                  {selectedTransaction.amountINR && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount (INR)</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(selectedTransaction.amountINR)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Direction</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${selectedTransaction.direction === 'credit'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                    <MaterialSymbol name={selectedTransaction.direction === 'credit' ? 'arrow_upward' : 'arrow_downward'} size={14} />
                    {selectedTransaction.direction === 'credit' ? 'Credit' : 'Debit'}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Timestamp</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedTransaction.timestamp.toLocaleString('en-IN', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

