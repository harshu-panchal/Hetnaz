import { MaterialSymbol } from "../types/material-symbol";
import { useTranslation } from "../../../core/hooks/useTranslation";

interface BalanceDisplayProps {
  balance: number;
}

export const BalanceDisplay = ({ balance }: BalanceDisplayProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-pink-100/60 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-3.5">
        <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
          <MaterialSymbol
            name="monetization_on"
            filled
            size={28}
            className="text-white drop-shadow-xs"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t("currentBalance", { defaultValue: "Current Balance" })}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {balance.toLocaleString()}
            </span>
            <span className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase tracking-wider">
              COINS
            </span>
          </div>
        </div>
      </div>
      <div className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900/40 text-pink-600 dark:text-pink-400 text-xs font-black flex items-center gap-1 shrink-0">
        <MaterialSymbol name="verified" filled size={14} />
        <span>Active</span>
      </div>
    </div>
  );
};
