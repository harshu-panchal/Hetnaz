import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';

interface WalletBalanceProps {
  balance: number;
  onTopUpClick?: () => void;
}

export const WalletBalance = ({ balance, onTopUpClick }: WalletBalanceProps) => {
  const formattedBalance = balance.toLocaleString();

  return (
    <div className="relative group overflow-hidden rounded-[2rem] bg-premium-pink p-6 shadow-2xl border border-white/40 dark:border-white/10 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
      {/* Liquid Mesh Interaction Layer */}
      <div className="absolute inset-0 bg-mesh-glass opacity-30" />
      
      {/* Atmospheric Shimmer and Glows */}
      <div className="absolute top-[-40%] right-[-10%] w-[80%] h-[80%] bg-white/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-black/10 rounded-full blur-[100px]" />
      
      {/* Glossy Reflection Card Edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/40 z-20" />

      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="skeuo-inset size-11 rounded-2xl flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/20 shadow-inner">
                <MaterialSymbol name="monetization_on" className="text-white drop-shadow-[0_2px_8px_rgba(255,182,193,0.6)]" size={24} filled />
             </div>
             <span className="text-[10px] font-black uppercase text-white tracking-[0.2em] opacity-90 drop-shadow-sm">GOLD VAULT</span>
          </div>
          
          {/* Tactical Top Up Button */}
          <button 
            onClick={onTopUpClick}
            className="skeuo-button h-10 items-center gap-2 rounded-2xl bg-primary/20 backdrop-blur-md flex px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-90 transition-all border-white/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white to-pink-50 opacity-10" />
            <MaterialSymbol name="add" size={18} className="relative z-10" />
            <span className="relative z-10">Top Up</span>
          </button>
        </div>

        <div className="flex flex-col mt-2">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.25em] opacity-60">AVAILABLE BALANCE</span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_4px_15px_rgba(255,255,255,0.4)]">{formattedBalance}</span>
            <span className="text-sm font-black text-white uppercase tracking-[0.15em] opacity-80">COINS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
