import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { FemaleTopNavbar } from '../components/FemaleTopNavbar';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import walletService from '../../../core/services/wallet.service';
import type { Transaction } from '../../../core/types/wallet.types';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const EarningsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();

  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleEarningsCount, setVisibleEarningsCount] = useState(10);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryData, txData] = await Promise.all([
        walletService.getEarningsSummary().catch(() => null),
        walletService.getMyTransactions({ direction: 'credit', limit: 50 }).catch(() => ({ transactions: [] })),
      ]);

      if (summaryData) {
        setSummary(summaryData);
        setBalance(summaryData.availableBalance || 0);
      }
      setTransactions(txData.transactions || []);
    } catch (err: any) {
      console.error('Failed to fetch earnings data:', err);
      setError(t('errorLoadEarnings')); // Fallback to a generic error message if specific one not found
    } finally {
      setIsLoading(false);
    }
  };

  // Get total earnings based on selected period
  const displayTotalEarnings = summary
    ? selectedPeriod === 'daily'
      ? summary.periodStats.daily
      : selectedPeriod === 'weekly'
        ? summary.periodStats.weekly
        : summary.periodStats.monthly
    : 0;

  // Get earnings breakdown by type
  const earningsByType = summary?.earningsByType || {};

  // Get icon for transaction type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message_earned':
        return 'mail';
      case 'video_call_earned':
        return 'videocam';
      case 'gift_received':
        return 'redeem';
      default:
        return 'monetization_on';
    }
  };

  // Format transaction type for display
  const formatType = (type: string) => {
    switch (type) {
      case 'message_earned':
        return t('typeMessage');
      case 'video_call_earned':
        return t('typeVideoCall');
      case 'gift_received':
        return t('typeGift');
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  // Filter earnings transactions
  const earningsTransactions = transactions.filter((t) => t.direction === 'credit' && t.type !== 'purchase');
  const hasMoreEarnings = earningsTransactions.length > visibleEarningsCount;

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('earnings')}</h1>
        </div>
        <button
          onClick={() => navigate('/female/withdrawal')}
          className="px-4 py-2 bg-primary text-slate-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors"
        >
          {t('withdraw')}
        </button>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
          <MaterialSymbol name="error" className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Earnings Summary */}
          <div className="px-6 py-4 space-y-4">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 rounded-xl p-6 border border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-600 dark:text-[#cbbc90]">
                  {t('totalEarningsPeriod', { period: t(selectedPeriod) })}
                </span>
                <MaterialSymbol name="trending_up" className="text-primary" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {displayTotalEarnings.toLocaleString()} coins
              </p>
              <p className="text-sm text-slate-500 dark:text-[#cbbc90]">
                {t('available')}: {balance.toLocaleString()} coins
              </p>
            </div>

            {/* Earnings by Type */}
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(earningsByType).map(([type, amount]) => (
                <div key={type} className="bg-white dark:bg-[#342d18] rounded-xl p-4 text-center shadow-sm">
                  <MaterialSymbol name={getTypeIcon(type)} className="text-primary mb-1" size={24} />
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{amount as number}</p>
                    <MaterialSymbol name="monetization_on" filled size={16} className="text-yellow-600 dark:text-gold" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[#cbbc90]">{formatType(type)}</p>
                </div>
              ))}
            </div>

            {/* Period Selector */}
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === period
                    ? 'bg-primary text-slate-900'
                    : 'bg-gray-200 dark:bg-[#342d18] text-gray-700 dark:text-white'
                    }`}
                >
                  {t(period)}
                </button>
              ))}
            </div>
          </div>

          {/* Earnings History */}
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('recentEarnings')}</h2>
            {earningsTransactions.length === 0 ? (
              <div className="text-center py-8">
                <MaterialSymbol name="account_balance_wallet" size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-[#cbbc90]">{t('noEarningsYet')}</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {earningsTransactions
                    .slice(0, visibleEarningsCount)
                    .map((tx) => (
                      <div
                        key={tx._id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-[#342d18] rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                            <MaterialSymbol name={getTypeIcon(tx.type)} filled />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatType(tx.type)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-[#cbbc90]">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          +{tx.amountCoins}
                        </p>
                      </div>
                    ))}
                </div>

                {/* Show More Button */}
                {hasMoreEarnings && (
                  <button
                    onClick={() => setVisibleEarningsCount(prev => prev + 10)}
                    className="w-full mt-4 px-4 py-3 bg-gray-200 dark:bg-[#342d18] text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors"
                  >
                    {t('showMore')}
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};
