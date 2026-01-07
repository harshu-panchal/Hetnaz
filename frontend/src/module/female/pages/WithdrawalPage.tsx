import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { FemaleTopNavbar } from '../components/FemaleTopNavbar';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import walletService from '../../../core/services/wallet.service';
import type { Withdrawal as WalletWithdrawal } from '../../../core/types/wallet.types';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const WithdrawalPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();

  const [withdrawals, setWithdrawals] = useState<WalletWithdrawal[]>([]);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'upi'>('bank');
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [upiId, setUpiId] = useState('');
  const [balance, setBalance] = useState(0);
  const minWithdrawal = 1000;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [balanceData, withdrawalData] = await Promise.all([
        walletService.getMyBalance().catch(() => ({ balance: 0 })),
        walletService.getMyWithdrawals().catch(() => ({ withdrawals: [] })),
      ]);

      setBalance(balanceData.balance || 0);
      setWithdrawals(withdrawalData.withdrawals || []);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(t('errorLoadWithdrawalData'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    const withdrawAmount = parseInt(amount);
    if (withdrawAmount < minWithdrawal) {
      setError(t('errorMinWithdrawal', { amount: minWithdrawal.toLocaleString() }));
      return;
    }
    if (withdrawAmount > balance) {
      setError(t('errorInsufficientBalance'));
      return;
    }
    setError(null);
    setIsPaymentDetailsOpen(true);
  };

  const handleSubmitWithdrawal = async () => {
    if (paymentMethod === 'bank') {
      if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
        setError(t('errorFillBankDetails'));
        return;
      }
    } else {
      if (!upiId || !upiId.includes('@')) {
        setError(t('errorValidUpi'));
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const withdrawalData = {
        coinsRequested: parseInt(amount),
        payoutMethod: paymentMethod === 'bank' ? 'bank' : 'UPI',
        payoutDetails: paymentMethod === 'bank'
          ? {
            accountHolderName: bankDetails.accountHolderName,
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
          }
          : {
            upiId: upiId,
          },
      };

      await walletService.requestWithdrawal(withdrawalData as any);

      setIsPaymentDetailsOpen(false);
      setIsSuccessOpen(true);

      // Reset form
      setAmount('');
      setBankDetails({ accountHolderName: '', accountNumber: '', ifscCode: '' });
      setUpiId('');

      // Refresh data
      fetchData();
    } catch (err: any) {
      console.error('Withdrawal request failed:', err);
      setError(err.response?.data?.message || t('errorSubmitWithdrawal'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return t('statusPaid');
      case 'pending':
        return t('statusPending');
      case 'approved':
        return t('statusApproved');
      case 'rejected':
        return t('statusRejected');
      case 'cancelled':
        return t('statusCancelled');
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20 font-display">
      {/* Top Navbar */}
      <FemaleTopNavbar />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
          >
            <MaterialSymbol name="arrow_back" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('withdrawal')}</h1>
        </div>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error Message */}
      {!isLoading && error && (
        <div className="px-4 py-2">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
            <MaterialSymbol name="error" className="text-red-500" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}>
              <MaterialSymbol name="close" size={18} />
            </button>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 min-h-0">
          {/* Available Balance */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 rounded-xl p-6 border border-primary/10">
            <p className="text-sm font-medium text-slate-600 dark:text-[#cbbc90] mb-2">{t('availableBalance')}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {balance.toLocaleString()} {t('coinBalance').split(' ')[0]} {/* Simplified coins suffix */}
            </p>
            <p className="text-xs text-slate-500 dark:text-[#cbbc90]">
              {t('minWithdrawalNote', { amount: minWithdrawal.toLocaleString() })}
            </p>
          </div>

          {/* Withdrawal Form */}
          <div className="bg-white dark:bg-[#342d18] rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('requestWithdrawal')}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                {t('amountCoins')}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min: ${minWithdrawal}`}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {/* INR Equivalent Display */}
              {amount && parseInt(amount) > 0 && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <span className="font-medium">{t('receiveApprox')}</span>
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    ₹{Math.round(parseInt(amount) * 0.5).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    {t('payoutRateNote')}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                {t('payoutMethod')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${paymentMethod === 'bank'
                    ? 'bg-primary text-slate-900'
                    : 'bg-gray-200 dark:bg-[#2a2515] text-gray-700 dark:text-white'
                    }`}
                >
                  {t('bankTransfer')}
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${paymentMethod === 'upi'
                    ? 'bg-primary text-slate-900'
                    : 'bg-gray-200 dark:bg-[#2a2515] text-gray-700 dark:text-white'
                    }`}
                >
                  {t('upi')}
                </button>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!amount || parseInt(amount) < minWithdrawal || parseInt(amount) > balance}
              className="w-full px-4 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('continue')}
            </button>
          </div>

          {/* Payment Details Modal */}
          {isPaymentDetailsOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={() => setIsPaymentDetailsOpen(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                  className="bg-white dark:bg-[#342d18] rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('payoutDetails')}</h2>
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
                      <p className="text-sm text-gray-600 dark:text-[#cbbc90] mb-1">{t('withdrawal')} {t('amountCoins')}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {parseInt(amount || '0').toLocaleString()} {t('coinBalance').split(' ')[0]}
                      </p>
                    </div>

                    {/* Payment Method Details */}
                    {paymentMethod === 'bank' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                            {t('accountHolderName')} *
                          </label>
                          <input
                            type="text"
                            value={bankDetails.accountHolderName}
                            onChange={(e) =>
                              setBankDetails({ ...bankDetails, accountHolderName: e.target.value })
                            }
                            placeholder={t('placeholderAccountHolderName')}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                            {t('accountNumber')} *
                          </label>
                          <input
                            type="text"
                            value={bankDetails.accountNumber}
                            onChange={(e) =>
                              setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                            }
                            placeholder={t('placeholderAccountNumber')}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                            {t('ifscCode')} *
                          </label>
                          <input
                            type="text"
                            value={bankDetails.ifscCode}
                            onChange={(e) =>
                              setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })
                            }
                            placeholder={t('placeholderIfscCode')}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                          {t('upiId')} *
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder={t('placeholderUpiId')}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-gray-500 dark:text-[#cbbc90] mt-1">
                          {t('upiIdHint')}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => setIsPaymentDetailsOpen(false)}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors disabled:opacity-50"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        onClick={handleSubmitWithdrawal}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                            {t('submitting')}
                          </>
                        ) : (
                          t('submitRequest')
                        )}
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
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
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
                    {t('withdrawalSubmittedTitle')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-[#cbbc90] mb-6">
                    {t('withdrawalSubmittedSuccess')}
                  </p>
                  <button
                    onClick={() => {
                      setIsSuccessOpen(false);
                      navigate('/female/dashboard');
                    }}
                    className="w-full px-4 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    {t('done')}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Withdrawal History */}
          <div className="pb-12">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('withdrawalHistory')}</h2>
            {withdrawals.length === 0 ? (
              <div className="text-center py-8">
                <MaterialSymbol name="account_balance_wallet" size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-[#cbbc90]">{t('noWithdrawalHistory')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal._id}
                    className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm border border-black/5 dark:border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {withdrawal.coinsRequested.toLocaleString()} {t('coinBalance').split(' ')[0]}
                      </p>
                      <span className={`text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
                        {getStatusText(withdrawal.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <MaterialSymbol
                        name={withdrawal.payoutMethod === 'bank' ? 'account_balance' : 'payments'}
                        size={16}
                        className="text-gray-400"
                      />
                      <p className="text-sm text-gray-500 dark:text-[#cbbc90]">
                        {withdrawal.payoutMethod === 'bank' ? t('bankTransfer') : t('upi')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-[#cbbc90]">
                      {t('requestedOn')}: {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </p>
                    {withdrawal.paidAt && (
                      <p className="text-xs text-gray-400 dark:text-[#cbbc90] mt-1">
                        {t('processedOn')}: {new Date(withdrawal.paidAt).toLocaleDateString()}
                      </p>
                    )}
                    {withdrawal.rejectionReason && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        {t('rejectionReasonLabel', { reason: withdrawal.rejectionReason })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};
