import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import type { Withdrawal } from '../types/female.types';

// Mock data - replace with actual API calls
const mockWithdrawals: Withdrawal[] = [
  {
    id: '1',
    amount: 5000,
    status: 'completed',
    paymentMethod: 'bank',
    bankDetails: {
      accountNumber: '****1234',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Emma',
    },
    requestedAt: '2024-01-10T10:00:00Z',
    processedAt: '2024-01-12T14:30:00Z',
  },
  {
    id: '2',
    amount: 3000,
    status: 'pending',
    paymentMethod: 'upi',
    upiDetails: {
      upiId: 'emma@paytm',
    },
    requestedAt: '2024-01-14T09:00:00Z',
  },
];

const navigationItems = [
  { id: 'dashboard', icon: 'home', label: 'Home' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats' },
  { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

export const WithdrawalPage = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(mockWithdrawals);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'upi'>('bank');
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [upiId, setUpiId] = useState('');
  const availableBalance = 12450;
  const minWithdrawal = 1000;

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/female/dashboard');
        break;
      case 'chats':
        navigate('/female/chats');
        break;
      case 'earnings':
        navigate('/female/earnings');
        break;
      case 'profile':
        navigate('/female/my-profile');
        break;
      default:
        break;
    }
  };

  const handleContinue = () => {
    const withdrawAmount = parseInt(amount);
    if (withdrawAmount < minWithdrawal) {
      alert(`Minimum withdrawal amount is ${minWithdrawal} coins`);
      return;
    }
    if (withdrawAmount > availableBalance) {
      alert('Insufficient balance');
      return;
    }
    setIsPaymentDetailsOpen(true);
  };

  const handleSubmitWithdrawal = () => {
    if (paymentMethod === 'bank') {
      if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
        alert('Please fill all bank details');
        return;
      }
    } else {
      if (!upiId || !upiId.includes('@')) {
        alert('Please enter a valid UPI ID');
        return;
      }
    }

    // Create withdrawal request
    const newWithdrawal: Withdrawal = {
      id: Date.now().toString(),
      amount: parseInt(amount),
      status: 'pending',
      paymentMethod,
      bankDetails: paymentMethod === 'bank' ? bankDetails : undefined,
      upiDetails: paymentMethod === 'upi' ? { upiId } : undefined,
      requestedAt: new Date().toISOString(),
    };

    setWithdrawals([newWithdrawal, ...withdrawals]);
    setIsPaymentDetailsOpen(false);
    setIsSuccessOpen(true);
    
    // Reset form
    setAmount('');
    setBankDetails({ accountHolderName: '', accountNumber: '', ifscCode: '' });
    setUpiId('');
  };

  const getStatusColor = (status: Withdrawal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-amber-600 dark:text-amber-400';
      case 'approved':
        return 'text-blue-600 dark:text-blue-400';
      case 'rejected':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
          >
            <MaterialSymbol name="arrow_back" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawal</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 rounded-xl p-6 border border-primary/10">
          <p className="text-sm font-medium text-slate-600 dark:text-[#cbbc90] mb-2">Available Balance</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {availableBalance.toLocaleString()} coins
          </p>
          <p className="text-xs text-slate-500 dark:text-[#cbbc90]">
            Minimum withdrawal: {minWithdrawal.toLocaleString()} coins
          </p>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white dark:bg-[#342d18] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Request Withdrawal</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
              Amount (coins)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min: ${minWithdrawal}`}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
              Payment Method
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  paymentMethod === 'bank'
                    ? 'bg-primary text-slate-900'
                    : 'bg-gray-200 dark:bg-[#2a2515] text-gray-700 dark:text-white'
                }`}
              >
                Bank Transfer
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  paymentMethod === 'upi'
                    ? 'bg-primary text-slate-900'
                    : 'bg-gray-200 dark:bg-[#2a2515] text-gray-700 dark:text-white'
                }`}
              >
                UPI
              </button>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!amount || parseInt(amount) < minWithdrawal || parseInt(amount) > availableBalance}
            className="w-full px-4 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>

        {/* Payment Details Modal */}
        {isPaymentDetailsOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsPaymentDetailsOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-white dark:bg-[#342d18] rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Details</h2>
                  <button
                    onClick={() => setIsPaymentDetailsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <MaterialSymbol name="close" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Withdrawal Amount Summary */}
                  <div className="bg-gray-50 dark:bg-[#2a2515] rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-[#cbbc90] mb-1">Withdrawal Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {parseInt(amount || '0').toLocaleString()} coins
                    </p>
                  </div>

                  {/* Payment Method Details */}
                  {paymentMethod === 'bank' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                          Account Holder Name *
                        </label>
                        <input
                          type="text"
                          value={bankDetails.accountHolderName}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, accountHolderName: e.target.value })
                          }
                          placeholder="Enter account holder name"
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          value={bankDetails.accountNumber}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                          }
                          placeholder="Enter account number"
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                          IFSC Code *
                        </label>
                        <input
                          type="text"
                          value={bankDetails.ifscCode}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })
                          }
                          placeholder="Enter IFSC code"
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                        UPI ID *
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="example@paytm"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <p className="text-xs text-gray-500 dark:text-[#cbbc90] mt-1">
                        Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe)
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setIsPaymentDetailsOpen(false)}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitWithdrawal}
                      className="flex-1 px-4 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Success Modal */}
        {isSuccessOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSuccessOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-white dark:bg-[#342d18] rounded-2xl shadow-xl max-w-sm w-full p-6 pointer-events-auto text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <MaterialSymbol name="check_circle" size={48} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Withdrawal Request Submitted!
                </h3>
                <p className="text-sm text-gray-600 dark:text-[#cbbc90] mb-6">
                  Your withdrawal request has been submitted successfully. You will be notified once it's processed.
                </p>
                <button
                  onClick={() => {
                    setIsSuccessOpen(false);
                    navigate('/female/dashboard');
                  }}
                  className="w-full px-4 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}

        {/* Withdrawal History */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Withdrawal History</h2>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <MaterialSymbol name="account_balance_wallet" size={48} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-[#cbbc90]">No withdrawal history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {withdrawal.amount.toLocaleString()} coins
                    </p>
                    <span className={`text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <MaterialSymbol
                      name={withdrawal.paymentMethod === 'bank' ? 'account_balance' : 'payments'}
                      size={16}
                      className="text-gray-400"
                    />
                    <p className="text-sm text-gray-500 dark:text-[#cbbc90]">
                      {withdrawal.paymentMethod === 'bank' ? 'Bank Transfer' : 'UPI'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-[#cbbc90]">
                    Requested: {new Date(withdrawal.requestedAt).toLocaleDateString()}
                  </p>
                  {withdrawal.processedAt && (
                    <p className="text-xs text-gray-400 dark:text-[#cbbc90] mt-1">
                      Processed: {new Date(withdrawal.processedAt).toLocaleDateString()}
                    </p>
                  )}
                  {withdrawal.rejectionReason && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      Reason: {withdrawal.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

