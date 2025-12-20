// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { WithdrawalRequest } from '../types/admin.types';

// Mock data - replace with actual API call
const mockWithdrawal: WithdrawalRequest = {
  id: '1',
  userId: '2',
  userName: 'Sarah Smith',
  userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC81hkr7IkYx1ryaWF6XEKAw50xyRvJBGMogrF-zD5ChG66QAopPNWZvczWXWXasmarotX6xfLiXqIGT-HGa4N4mpnfl6tHPN16fBm5L0ebBFFR6YnfhOhNpt_PXB-rNdw4iozv00ERuqlCKno-B1P2UZ6g-dU5YY4Or_m3Xdgk4_MrxVK9o6Uz70Vr_fXQdMhSrjjCl7s_yQE_R1O9FNwroQqdfSFv6kiO76qVxmnHDhLrYwRWtfdSdegsNjAzgAdgkUZgUomw2j8',
  coinsRequested: 5000,
  payoutAmountINR: 5000,
  payoutMethod: 'UPI',
  payoutDetails: {
    upiId: 'sarah.smith@paytm',
  },
  status: 'pending',
  createdAt: '2024-01-20T10:00:00Z',
  payoutPercentage: 80,
};

export const RejectWithdrawalPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();
  const [withdrawal, setWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (requestId) {
      // TODO: API call to fetch withdrawal details
      setWithdrawal(mockWithdrawal);
    }
  }, [requestId]);

  const handleSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsSubmitting(true);
    // TODO: API call to reject withdrawal
    console.log('Rejecting withdrawal:', { requestId, reason: rejectionReason });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setIsSubmitting(false);
    navigate('/admin/withdrawals');
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const formatDate = (date: Date) => date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (!withdrawal) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
        <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          items={navigationItems}
          onItemClick={handleNavigationClick}
        />
        <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <MaterialSymbol name="error" className="text-gray-400 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Withdrawal Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The withdrawal request you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/admin/withdrawals')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Withdrawals
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden">
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/withdrawals')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <MaterialSymbol name="arrow_back" size={20} />
              <span className="font-medium">Back to Withdrawals</span>
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <MaterialSymbol name="cancel" className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reject Withdrawal</h1>
                <p className="text-gray-600 dark:text-gray-400">Provide a reason for rejecting this withdrawal request</p>
              </div>
            </div>
          </div>

          {/* Withdrawal Details Card */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden shadow-lg">
                  {withdrawal.userAvatar ? (
                    <img src={withdrawal.userAvatar} alt={withdrawal.userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {withdrawal.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">{withdrawal.userName}</h2>
                  <p className="text-red-100">Request ID: {withdrawal.id}</p>
                  <p className="text-red-100 text-sm mt-1">
                    Requested: {formatDate(new Date(withdrawal.createdAt))}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Requested Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(withdrawal.payoutAmountINR)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Coins</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{withdrawal.coinsRequested.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Payout Method</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{withdrawal.payoutMethod}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {withdrawal.payoutMethod === 'UPI' ? 'UPI ID' : 'Account Number'}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white break-all">
                    {withdrawal.payoutMethod === 'UPI'
                      ? withdrawal.payoutDetails.upiId
                      : withdrawal.payoutDetails.accountNumber}
                  </p>
                </div>
              </div>

              {withdrawal.payoutMethod === 'bank' && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Account Holder Name</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{withdrawal.payoutDetails.accountHolderName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">IFSC Code</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{withdrawal.payoutDetails.ifscCode}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Form */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Rejection Reason</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please provide a clear reason for rejecting this withdrawal request. This reason will be sent to the user.
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection (e.g., insufficient balance, invalid account details, policy violation, etc.)..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none shadow-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {rejectionReason.length} characters
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MaterialSymbol name="warning" className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={24} />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-1">Important Notice</p>
                    <p className="text-xs text-yellow-800 dark:text-yellow-400">
                      Once rejected, the user's coins will be returned to their account. They can submit a new withdrawal request after addressing the issue.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/admin/withdrawals')}
                  className="flex-1 min-w-[120px] px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!rejectionReason.trim() || isSubmitting}
                  className="flex-1 min-w-[120px] px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <MaterialSymbol name="hourglass_empty" size={20} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MaterialSymbol name="cancel" size={20} />
                      Reject Withdrawal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

