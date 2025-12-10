import { MaterialSymbol } from '../types/material-symbol';

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
  const formattedTotal = totalEarnings.toLocaleString();
  const formattedAvailable = availableBalance.toLocaleString();
  const formattedPending = pendingWithdrawals.toLocaleString();

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 p-4 shadow-sm border border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
            <MaterialSymbol name="account_balance_wallet" filled />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-600 dark:text-[#cbbc90]">Total Earnings</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">
              {formattedTotal}
            </span>
          </div>
        </div>
        <button
          onClick={onViewEarningsClick}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 px-3 text-xs font-semibold text-primary transition-all active:scale-95"
        >
          <MaterialSymbol name="trending_up" size={16} />
          View
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col rounded-lg bg-white/50 dark:bg-[#342d18]/50 p-2.5">
          <span className="text-xs font-medium text-slate-500 dark:text-[#cbbc90] mb-1">Available</span>
          <span className="text-base font-bold text-green-600 dark:text-green-400 leading-none">
            {formattedAvailable}
          </span>
        </div>
        <div className="flex flex-col rounded-lg bg-white/50 dark:bg-[#342d18]/50 p-2.5">
          <span className="text-xs font-medium text-slate-500 dark:text-[#cbbc90] mb-1">Pending</span>
          <span className="text-base font-bold text-amber-600 dark:text-amber-400 leading-none">
            {formattedPending}
          </span>
        </div>
      </div>

      <button
        onClick={onWithdrawClick}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-slate-900 transition-all hover:bg-yellow-400 hover:shadow-lg active:scale-95 duration-200"
      >
        <MaterialSymbol name="payments" size={18} />
        Request Withdrawal
      </button>
    </div>
  );
};


