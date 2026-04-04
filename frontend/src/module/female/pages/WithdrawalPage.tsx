// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import walletService from '../../../core/services/wallet.service';
import type { Withdrawal as WalletWithdrawal } from '../../../core/types/wallet.types';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { MeshBackground } from '../../../shared/components/auth/AuthLayoutComponents';

export const WithdrawalPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();

  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'UPI' | 'bank'>('UPI');
  const [upiId, setUpiId] = useState<string>('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  });

  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<WalletWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [summary, historyData] = await Promise.all([
        walletService.getEarningsSummary(),
        walletService.getMyWithdrawals({ limit: 10 }),
      ]);

      setBalance(summary.availableBalance || 0);
      setHistory(historyData.withdrawals || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const withdrawalAmount = parseInt(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError(t('invalidAmount'));
      return;
    }

    if (withdrawalAmount > balance) {
      setError(t('insufficientBalance'));
      return;
    }

    if (method === 'UPI' && !upiId) {
      setError(t('upiRequired'));
      return;
    }

    if (method === 'bank' && (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName)) {
      setError(t('bankDetailsRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      const details = method === 'UPI' ? { upiId } : bankDetails;
      await walletService.requestWithdrawal({
        amount: withdrawalAmount,
        method,
        details
      });

      setSuccess(t('withdrawalRequested'));
      setAmount('');
      setUpiId('');
      setBankDetails({ accountNumber: '', ifscCode: '', accountHolderName: '' });
      fetchData(); // Refresh history and balance
    } catch (err: any) {
      setError(err.response?.data?.message || t('withdrawalFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'cancelled': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="font-display text-slate-900 dark:text-white antialiased selection:bg-pink-500 selection:text-white min-h-screen relative overflow-hidden flex flex-col bg-background-light dark:bg-[#0a0a0a] pb-24">
      <MeshBackground />

      {/* Premium Header */}
      <header className="relative z-30 flex items-center justify-between px-4 pb-6 pt-4 bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-b border-white/20 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="skeuo-button h-12 w-12 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border-white/60 text-slate-600 dark:text-white active:scale-90 transition-all font-black"
          >
            <MaterialSymbol name="arrow_back" size={24} />
          </button>
          <div className="space-y-0.5">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 leading-none">{t('wallet')}</h1>
            <h2 className="text-xl font-black tracking-tight dark:text-white">{t('withdrawal')}</h2>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 space-y-8">
        {/* Balance Vault Card */}
        <div className="group relative overflow-hidden skeuo-card bg-mesh-glass rounded-[2.5rem] p-8 border-white/60 dark:border-white/10 shadow-2xl transition-all hover:translate-y-[-2px]">
           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
           <div className="flex flex-col gap-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="skeuo-inset size-14 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500">
                   <MaterialSymbol name="account_balance_wallet" size={32} filled />
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">{t('availableBalance')}</span>
                   <div className="flex items-center gap-2">
                      <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                        {balance.toLocaleString()}
                      </p>
                      <MaterialSymbol name="monetization_on" className="text-amber-500 text-xl" filled />
                   </div>
                </div>
              </div>
              
              <div className="skeuo-inset bg-black/5 dark:bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                 <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">100 coins = ₹10 (Conversion)</span>
                 <p className="text-xs font-black text-amber-500 uppercase tracking-widest">₹{(balance * 0.1).toFixed(2)}</p>
              </div>
           </div>
        </div>

        {/* Withdrawal Form */}
        <div className="skeuo-card bg-white/40 dark:bg-black/20 backdrop-blur-3xl rounded-[2.5rem] p-8 space-y-8 border-white/60 dark:border-white/5 shadow-xl">
          <div className="flex items-center gap-3">
             <div className="skeuo-inset size-10 rounded-xl flex items-center justify-center bg-pink-500/10 text-pink-500">
                <MaterialSymbol name="request_quote" size={24} />
             </div>
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{t('requestWithdrawal')}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="skeuo-card bg-rose-500/10 border-rose-500/20 px-4 py-3 rounded-2xl text-xs font-black text-rose-500 flex items-center gap-2">
                <MaterialSymbol name="error" size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="skeuo-card bg-emerald-500/10 border-emerald-500/20 px-4 py-3 rounded-2xl text-xs font-black text-emerald-500 flex items-center gap-2">
                <MaterialSymbol name="check_circle" size={16} />
                {success}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">{t('withdrawalAmount')}</label>
              <div className="skeuo-inset bg-white/20 dark:bg-black/20 rounded-2xl p-1 relative overflow-hidden group focus-within:ring-2 focus-within:ring-pink-500/20 transition-all border border-white/5">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent border-none text-slate-900 dark:text-white px-4 py-3 placeholder-slate-400 focus:ring-0 text-lg font-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-slate-400">coins</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">{t('paymentMethod')}</label>
              <div className="skeuo-inset bg-white/20 dark:bg-black/40 rounded-2xl p-1.5 flex gap-2 border border-white/5">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    method === 'UPI' ? 'skeuo-button bg-pink-500 text-white shadow-pink-500/20' : 'text-slate-400'
                  }`}
                >
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    method === 'bank' ? 'skeuo-button bg-pink-500 text-white shadow-pink-500/20' : 'text-slate-400'
                  }`}
                >
                  BANK
                </button>
              </div>
            </div>

            <div className="pt-2 animate-in slide-in-from-bottom-4 duration-500">
              {method === 'UPI' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">UPI ID</label>
                  <div className="skeuo-inset bg-white/20 dark:bg-black/20 rounded-2xl p-1 border border-white/5">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="example@upi"
                      className="w-full bg-transparent border-none text-slate-900 dark:text-white px-4 py-3 placeholder-slate-400 focus:ring-0 text-sm font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">Account Holder Name</label>
                    <div className="skeuo-inset bg-white/20 dark:bg-black/20 rounded-2xl p-1 border border-white/5">
                      <input
                        type="text"
                        value={bankDetails.accountHolderName}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                        className="w-full bg-transparent border-none text-slate-900 dark:text-white px-4 py-3 placeholder-slate-400 focus:ring-0 text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">Account Number</label>
                      <div className="skeuo-inset bg-white/20 dark:bg-black/20 rounded-2xl p-1 border border-white/5">
                        <input
                          type="text"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                          className="w-full bg-transparent border-none text-slate-900 dark:text-white px-4 py-3 placeholder-slate-400 focus:ring-0 text-[11px] font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">IFSC Code</label>
                      <div className="skeuo-inset bg-white/20 dark:bg-black/20 rounded-2xl p-1 border border-white/5">
                        <input
                          type="text"
                          value={bankDetails.ifscCode}
                          onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                          className="w-full bg-transparent border-none text-slate-900 dark:text-white px-4 py-3 placeholder-slate-400 focus:ring-0 text-[11px] font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="skeuo-button w-full h-14 bg-pink-500 text-white font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-pink-500/40 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('submitting')}</span>
                </div>
              ) : (
                t('submitRequest')
              )}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
             <div className="skeuo-inset size-8 rounded-xl flex items-center justify-center bg-gray-50/50 dark:bg-black/20">
               <MaterialSymbol name="history" size={18} className="text-pink-500" />
             </div>
             <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">{t('withdrawalHistory')}</h3>
          </div>

          <div className="skeuo-card rounded-[2.5rem] overflow-hidden bg-white/20 dark:bg-black/10 shadow-xl border-white/60 dark:border-white/5 divide-y divide-white/10">
              {isLoading ? (
                <div className="flex justify-center py-20 opacity-40">
                  <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="py-24 text-center space-y-6 opacity-40">
                  <div className="skeuo-inset size-24 rounded-[2.5rem] inline-flex items-center justify-center bg-gray-50/50 dark:bg-black/20">
                    <MaterialSymbol name="wallet" size={48} className="text-slate-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('noWithdrawalsYet')}</p>
                </div>
              ) : (
                history.map((withdrawal) => (
                  <div key={withdrawal._id} className="flex items-center justify-between p-6 group transition-colors hover:bg-white/10">
                     <div className="flex items-center gap-4">
                        <div className={`skeuo-inset size-12 rounded-2xl flex items-center justify-center border ${getStatusColor(withdrawal.status)}`}>
                           <MaterialSymbol name={withdrawal.method === 'UPI' ? 'send' : 'account_balance'} size={24} filled />
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900 dark:text-white">₹{withdrawal.payoutAmountINR}</p>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">({withdrawal.status})</span>
                           </div>
                           <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                             {new Date(withdrawal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">-{withdrawal.coinsRequested}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">COINS</p>
                     </div>
                  </div>
                ))
              )}
          </div>
        </div>
      </main>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};
