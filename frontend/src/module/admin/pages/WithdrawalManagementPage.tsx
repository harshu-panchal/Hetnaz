import { useState, useMemo, useEffect } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { WithdrawalRequestCard } from '../components/WithdrawalRequestCard';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import walletService from '../../../core/services/wallet.service';

// Map backend withdrawal to component format
interface WithdrawalDisplay {
  _id: string;
  userId: any;
  coinsRequested: number;
  payoutMethod: 'UPI' | 'bank';
  payoutDetails: any;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  payoutAmountINR?: number;
  payoutPercentage?: number;
  createdAt: string;
  paidAt?: string;
  rejectionReason?: string;
  userName?: string;
}

export const WithdrawalManagementPage = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalDisplay[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'paid'>('all');
  const [payoutMethodFilter, setPayoutMethodFilter] = useState<'all' | 'UPI' | 'bank'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await walletService.getPendingWithdrawals();
      setWithdrawals(data.withdrawals || []);
    } catch (err: any) {
      console.error('Failed to fetch withdrawals:', err);
      setError(err.response?.data?.message || 'Failed to load withdrawals');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((withdrawal) => {
      // Status filter
      const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;

      // Payout method filter
      const matchesMethod = payoutMethodFilter === 'all' || withdrawal.payoutMethod === payoutMethodFilter;

      // Search filter
      const userName = (withdrawal as any).userId?.name || withdrawal.userName || '';
      const matchesSearch =
        searchQuery === '' ||
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        withdrawal._id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesMethod && matchesSearch;
    });
  }, [withdrawals, statusFilter, payoutMethodFilter, searchQuery]);

  const handleApprove = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await walletService.approveWithdrawal(requestId);
      // Update local state
      setWithdrawals((prev) =>
        prev.map((w) =>
          w._id === requestId
            ? { ...w, status: 'approved' as const }
            : w
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      setActionLoading(requestId);
      await walletService.rejectWithdrawal(requestId, reason);
      // Update local state
      setWithdrawals((prev) =>
        prev.map((w) =>
          w._id === requestId
            ? { ...w, status: 'rejected' as const, rejectionReason: reason }
            : w
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await walletService.markWithdrawalPaid(requestId);
      // Update local state
      setWithdrawals((prev) =>
        prev.map((w) =>
          w._id === requestId
            ? { ...w, status: 'paid' as const, paidAt: new Date().toISOString() }
            : w
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestInfo = (requestId: string) => {
    console.log(`Requesting more info for withdrawal ${requestId}`);
    alert('Feature coming soon: Request more information from user');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPending = withdrawals.filter((w) => w.status === 'pending').reduce((sum, w) => sum + (w.payoutAmountINR || 0), 0);
  const totalApproved = withdrawals.filter((w) => w.status === 'approved').reduce((sum, w) => sum + (w.payoutAmountINR || 0), 0);
  const totalPaid = withdrawals.filter((w) => w.status === 'paid').reduce((sum, w) => sum + (w.payoutAmountINR || 0), 0);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gray-50 dark:bg-[#0a0a0a] overflow-x-hidden">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Withdrawal Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Review and process withdrawal requests</p>
            </div>
            <button
              onClick={fetchWithdrawals}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <MaterialSymbol name="refresh" size={20} />
              Refresh
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
              <MaterialSymbol name="error" className="text-red-500" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <MaterialSymbol name="close" size={18} />
              </button>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                        {formatCurrency(totalPending)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {withdrawals.filter((w) => w.status === 'pending').length} requests
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <MaterialSymbol name="pending" className="text-orange-600 dark:text-orange-400" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {formatCurrency(totalApproved)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {withdrawals.filter((w) => w.status === 'approved').length} requests
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <MaterialSymbol name="check_circle" className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {formatCurrency(totalPaid)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {withdrawals.filter((w) => w.status === 'paid').length} requests
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <MaterialSymbol name="payments" className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {withdrawals.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {withdrawals.filter((w) => w.status === 'rejected').length} rejected
                      </p>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <MaterialSymbol name="receipt_long" className="text-gray-600 dark:text-gray-400" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <MaterialSymbol
                        name="search"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search by user name or request ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setPayoutMethodFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${payoutMethodFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    All Methods
                  </button>
                  <button
                    onClick={() => setPayoutMethodFilter('UPI')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${payoutMethodFilter === 'UPI'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    UPI Only
                  </button>
                  <button
                    onClick={() => setPayoutMethodFilter('bank')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${payoutMethodFilter === 'bank'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    Bank Transfer Only
                  </button>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredWithdrawals.length}</span> of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{withdrawals.length}</span> requests
                </div>
              </div>

              {/* Withdrawal Cards */}
              {filteredWithdrawals.length === 0 ? (
                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                  <MaterialSymbol name="account_balance_wallet" className="text-gray-400 dark:text-gray-600 mx-auto mb-4" size={64} />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No withdrawal requests found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery || statusFilter !== 'all' || payoutMethodFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No withdrawal requests at this time'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredWithdrawals.map((request) => (
                    <WithdrawalRequestCard
                      key={request._id}
                      request={{
                        id: request._id,
                        userId: (request as any).userId?._id || '',
                        userName: request.userName || (request as any).userId?.profile?.name || 'Unknown User',
                        coinsRequested: request.coinsRequested,
                        payoutMethod: request.payoutMethod,
                        payoutDetails: request.payoutDetails,
                        status: request.status === 'cancelled' ? 'rejected' : request.status as any,
                        payoutAmountINR: request.payoutAmountINR || 0,
                        payoutPercentage: request.payoutPercentage || 50,
                        createdAt: request.createdAt,
                        reviewedBy: (request as any).approvedBy?.name || (request as any).rejectedBy?.name,
                        reviewNotes: request.rejectionReason,
                        paidAt: request.paidAt,
                      }}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onMarkPaid={handleMarkPaid}
                      onRequestInfo={handleRequestInfo}
                      isLoading={actionLoading === request._id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
