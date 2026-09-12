import { MaterialSymbol } from "../types/material-symbol";

export type TransactionType = "purchase" | "spent" | "bonus" | "gift" | "other";

interface TransactionItemProps {
  id: string;
  type: TransactionType;
  title: string;
  timestamp: string;
  amount: number;
  isPositive: boolean;
}

export const TransactionItem = ({
  type,
  title,
  timestamp,
  amount,
  isPositive,
}: TransactionItemProps) => {
  const getIconData = () => {
    switch (type) {
      case "purchase":
        return {
          name: "add_circle",
          textColor: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-200/70 dark:border-amber-800/40",
        };
      case "spent":
        return {
          name: "favorite",
          textColor: "text-rose-500",
          bgColor: "bg-rose-50 dark:bg-rose-950/30",
          borderColor: "border-rose-200/70 dark:border-rose-800/40",
        };
      case "bonus":
        return {
          name: "redeem",
          textColor: "text-emerald-500",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
          borderColor: "border-emerald-200/70 dark:border-emerald-800/40",
        };
      case "gift":
        return {
          name: "card_giftcard",
          textColor: "text-purple-500",
          bgColor: "bg-purple-50 dark:bg-purple-950/30",
          borderColor: "border-purple-200/70 dark:border-purple-800/40",
        };
      default:
        return {
          name: "toll",
          textColor: "text-blue-500",
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
          borderColor: "border-blue-200/70 dark:border-blue-800/40",
        };
    }
  };

  const icon = getIconData();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 mb-2.5 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-xs hover:border-amber-200/60 transition-all group">
      {/* Left Column: Icon & Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`size-11 rounded-2xl flex items-center justify-center shrink-0 border ${icon.bgColor} ${icon.borderColor} shadow-2xs group-hover:scale-105 transition-transform`}>
          <MaterialSymbol
            name={icon.name as any}
            size={22}
            className={icon.textColor}
            filled
          />
        </div>

        <div className="flex flex-col min-w-0 space-y-0.5">
          <p className="text-slate-900 dark:text-white text-sm font-black tracking-tight truncate max-w-[180px] sm:max-w-xs">
            {title}
          </p>
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-semibold">
            <MaterialSymbol name="schedule" size={12} />
            <span>{timestamp}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Amount Pill */}
      <div className="shrink-0 pl-2">
        <div
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black font-mono shadow-2xs ${
            isPositive
              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/40"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
          }`}>
          <MaterialSymbol
            name={isPositive ? "add" : "remove"}
            size={13}
            className="font-black"
          />
          <span>{Math.abs(amount).toLocaleString()}</span>
          <span className="text-[9px] font-black uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80 ml-0.5">
            COINS
          </span>
        </div>
      </div>
    </div>
  );
};
