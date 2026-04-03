import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

export type PlanTier = 'basic' | 'silver' | 'gold' | 'platinum' | string;

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

  const getTierGradient = () => {
    if (isBestValue) return 'bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]';
    if (isPopular) return 'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]';
    return 'bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10';
  };

  const getButtonClass = () => {
    if (isBestValue) return 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30';
    if (isPopular) return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/30';
    return 'bg-white/80 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm';
  };

  return (
    <div
      className={`relative flex flex-col items-center gap-4 rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden ${getTierGradient()}`}
    >
      {/* Floating Badge (Glass style) */}
      {badge && (
        <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter backdrop-blur-md border border-white/20 shadow-sm z-20 ${
          isBestValue ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'
        }`}>
          {badge}
        </div>
      )}

      {/* Bonus Ribbon (Diagonal Left) */}
      {tier.toLowerCase() === 'silver' && (
        <div className="absolute -left-8 top-3 px-8 py-1 bg-blue-600 text-white text-[9px] font-black -rotate-45 shadow-lg z-10 uppercase tracking-tighter">
          BONUS
        </div>
      )}

      {/* Content Section */}
      <div className="flex flex-col items-center gap-1 w-full mt-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-white/50">
          {t(tier.toUpperCase())}
        </span>
        
        <div className="flex flex-col items-center gap-0 my-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className={`text-3xl font-black tracking-tighter text-slate-900 dark:text-white transition-all ${
              isPopular || isBestValue ? 'text-glow-gold' : ''
            }`}>
              {coins.toLocaleString()}
            </span>
            <MaterialSymbol name="monetization_on" filled size={24} className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
          </div>
          
          {bonus && (
             <div className="mt-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
               <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">
                 {bonus}
               </span>
             </div>
          )}
        </div>

        <div className="flex flex-col items-center mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-400">₹</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
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
        onClick={onBuyClick}
        disabled={disabled}
        className={`w-full h-11 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all active:scale-[0.96] flex items-center justify-center gap-2 ${getButtonClass()} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
      >
        {disabled ? t('loading') : t('buyCoins')}
        {(isPopular || isBestValue) && !disabled && (
          <MaterialSymbol name={isBestValue ? "diamond" : "bolt"} size={18} className="animate-pulse" />
        )}
      </button>
    </div>
  );
};

