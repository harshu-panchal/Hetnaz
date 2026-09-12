import { MaterialSymbol } from "../types/material-symbol";
import { useTranslation } from "../../../core/hooks/useTranslation";

export type PlanTier = "basic" | "silver" | "gold" | "platinum" | string;

interface CoinPlanCardProps {
  tier: PlanTier;
  price: number;
  coins: number;
  originalPrice?: number;
  bonus?: string;
  badge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  onBuyClick?: () => void;
  disabled?: boolean;
}

export const CoinPlanCard = ({
  tier,
  price,
  coins,
  originalPrice,
  bonus,
  badge,
  isPopular = false,
  isBestValue = false,
  onBuyClick,
  disabled = false,
}: CoinPlanCardProps) => {
  const { t } = useTranslation();
  const isHighlight = isPopular || isBestValue;

  return (
    <div
      onClick={!disabled ? onBuyClick : undefined}
      className={`relative flex flex-col justify-between rounded-3xl p-5 transition-all duration-300 cursor-pointer overflow-hidden border ${
        isHighlight
          ? "bg-gradient-to-b from-pink-50/90 via-white to-rose-50/50 dark:from-pink-950/20 dark:via-slate-900 dark:to-rose-950/10 border-pink-400 dark:border-pink-600 shadow-md shadow-pink-500/10 hover:scale-[1.02]"
          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xs hover:border-pink-200 dark:hover:border-slate-700 hover:scale-[1.01]"
      }`}>
      {/* Floating Badge on Top */}
      {badge ? (
        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-2xs z-20">
          {badge}
        </div>
      ) : isHighlight ? (
        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-2xs z-20">
          BEST VALUE
        </div>
      ) : null}

      {/* Header Tier */}
      <div className="flex flex-col items-center gap-1 w-full pt-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {t(tier.toUpperCase(), { defaultValue: tier.toUpperCase() })}
        </span>

        {/* Coins Total */}
        <div className="flex items-center justify-center gap-1.5 my-2">
          <MaterialSymbol
            name="monetization_on"
            filled
            size={26}
            className="text-amber-500 drop-shadow-xs"
          />
          <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            {coins.toLocaleString()}
          </span>
        </div>

        {/* Bonus Pill */}
        {bonus ? (
          <div className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-300 uppercase tracking-wide">
              {bonus}
            </span>
          </div>
        ) : (
          <div className="h-6" />
        )}

        {/* Price Tag */}
        <div className="flex flex-col items-center my-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black text-slate-400">₹</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {price.toLocaleString()}
            </span>
          </div>
          {originalPrice && (
            <span className="text-[10px] text-slate-400 line-through opacity-60">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBuyClick?.();
        }}
        disabled={disabled}
        className={`w-full h-11 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs ${
          isHighlight
            ? "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/25"
            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
        } ${disabled ? "opacity-50 grayscale cursor-not-allowed" : ""}`}>
        <span>
          {disabled
            ? t("loading", { defaultValue: "Loading" })
            : t("buyCoins", { defaultValue: "Buy Coins" })}
        </span>
        {isHighlight && !disabled && (
          <MaterialSymbol
            name="bolt"
            size={16}
            className="text-amber-200 animate-pulse"
            filled
          />
        )}
      </button>
    </div>
  );
};
