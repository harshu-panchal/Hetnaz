import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface EarningsCardProps {
  totalEarnings: number;
  availableBalance: number;
  pendingWithdrawals: number;
  onViewEarningsClick?: () => void;
  onWithdrawClick?: () => void;
}

export const EarningsCard = ({
  totalEarnings,
  availableBalance,
  pendingWithdrawals,
  onViewEarningsClick,
  onWithdrawClick,
}: EarningsCardProps) => {
  const { t } = useTranslation();
  const formattedTotal = totalEarnings.toLocaleString();
  const formattedAvailable = availableBalance.toLocaleString();
  const formattedPending = pendingWithdrawals.toLocaleString();

  return (
    <div className="group relative w-full overflow-hidden skeuo-card bg-mesh-glass rounded-[2rem] p-6 border-white/60 dark:border-white/5 shadow-2xl transition-all hover:translate-y-[-2px]">
      {/* Glossy Reflection Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MaterialSymbol name="account_balance_wallet" className="text-pink-500" size={36} filled />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-0.5">{t('totalEarnings')}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formattedTotal}
                </span>
                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">{t('coins')}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onViewEarningsClick}
            className="skeuo-button size-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
          >
            <MaterialSymbol name="trending_up" size={20} className="text-pink-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="skeuo-inset bg-gray-50/30 dark:bg-black/20 rounded-2xl p-4 flex flex-col gap-1 border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">{t('available')}</span>
            <span className="text-lg font-black text-emerald-500 dark:text-emerald-400 tracking-tight leading-none group-hover:scale-105 transition-transform origin-left">
              {formattedAvailable}
            </span>
          </div>
          <div className="skeuo-inset bg-gray-50/30 dark:bg-black/20 rounded-2xl p-4 flex flex-col gap-1 border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">{t('pending')}</span>
            <span className="text-lg font-black text-amber-500 dark:text-amber-400 tracking-tight leading-none group-hover:scale-105 transition-transform origin-left">
              {formattedPending}
            </span>
          </div>
        </div>

        <button
          onClick={onWithdrawClick}
          className="relative w-full h-14 skeuo-button bg-pink-500 rounded-2xl flex items-center justify-center gap-3 group/btn overflow-hidden transition-all active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          <MaterialSymbol name="payments" size={24} className="text-white drop-shadow-md" />
          <span className="text-xs font-black uppercase tracking-[0.25em] text-white drop-shadow-sm">{t('withdraw')}</span>
        </button>
      </div>
    </div>
  );
};



