import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface WalletBalanceCardProps {
  balance: number;
  memberTier?: 'basic' | 'silver' | 'gold' | 'platinum';
  userAvatar?: string;
  userName?: string;
  onAddCoins?: () => void;
}

// Tier styling config matching app theme
const tierStyles = {
  basic: {
    labelKey: 'freeMember',
    icon: 'verified',
    badgeBg: 'bg-white/20 backdrop-blur-md border-white/30 text-white',
    crownColor: 'text-pink-200',
  },
  silver: {
    labelKey: 'SILVER',
    icon: 'star',
    badgeBg: 'bg-slate-900/40 backdrop-blur-md border-white/30 text-white',
    crownColor: 'text-slate-200',
  },
  gold: {
    labelKey: 'GOLD',
    icon: 'crown',
    badgeBg: 'bg-amber-900/40 backdrop-blur-md border-amber-300/50 text-amber-200',
    crownColor: 'text-yellow-300',
  },
  platinum: {
    labelKey: 'PLATINUM',
    icon: 'diamond',
    badgeBg: 'bg-purple-950/40 backdrop-blur-md border-purple-300/50 text-purple-200',
    crownColor: 'text-purple-300',
  },
};

export const WalletBalanceCard = ({
  balance,
  memberTier = 'basic',
  userAvatar,
  userName = 'Member',
  onAddCoins,
}: WalletBalanceCardProps) => {
  const { t } = useTranslation();
  const formattedBalance = (balance || 0).toLocaleString();
  const defaultAvatar =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBoS_YLtV4hpNVbbyf0nrVmbQX6vzgn-xGLdye-t2gBz0LRib9HX4PeYJIj364IRM63hBRKmTLtWfuVOfikvNIryKKMjql6Ig1suPsbWoA45Vt8rO0N-wt7qwqIwMBV4Gaw6j7ooJER4L9QExcc20SNkyk1schLm-swXJOgx5ez3objGGhUPsbWoA45Vt8rO0N-wt7qwqIwMBV4Gaw6j7ooJER4L9QExcc20SNkyk1schLm-swXJOgx5ez3objGGhUPZpOMLYRY2W5WgHwClZhJ-JaWw470QybQVyCQD-hZYfamq_iJqx0EAJE0UNaa6Ee3_FbUUYSuUIIViQ_QxI6ytCepxc';

  const currentTier = memberTier || 'basic';
  const style = tierStyles[currentTier] || tierStyles.basic;
  const tierLabel = currentTier === 'basic'
    ? t('freeMember')
    : `${t(style.labelKey)} ${t('member')}`;

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-[#1e1b4b] border border-pink-300/40 shadow-xl shadow-pink-500/20 p-6 text-white transition-all duration-300">
      {/* Background Ambience & Theme Shimmer */}
      <div className="absolute -top-16 -right-16 size-48 bg-pink-400/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 size-48 bg-purple-600/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.3),transparent_65%)] pointer-events-none" />

      {/* Decorative Brand Coin Watermark */}
      <div className="absolute -right-4 -bottom-6 pointer-events-none select-none opacity-15">
        <MaterialSymbol name="monetization_on" filled size={160} className="text-white" />
      </div>

      {/* Card Content Layer */}
      <div className="relative z-10 flex flex-col justify-between min-h-[170px]">
        {/* Top Row: User Identity & VIP Chip */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={userAvatar || defaultAvatar}
                alt="Avatar"
                className="size-11 rounded-full object-cover border-2 border-white/80 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border border-white flex items-center justify-center shadow-xs">
                <MaterialSymbol name="crown" size={12} className="text-amber-950" filled />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white truncate max-w-[150px]">
                {userName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${style.badgeBg}`}>
                  <MaterialSymbol name={style.icon as any} filled size={10} className={style.crownColor} />
                  {tierLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Dil Mate Coin Vault Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 text-white shadow-xs shrink-0">
            <MaterialSymbol name="verified_user" filled size={13} className="text-pink-300" />
            <span className="text-[10px] font-black tracking-widest uppercase text-white/95">DIL MATE PAY</span>
          </div>
        </div>

        {/* Center Row: Coin Balance */}
        <div className="mt-5">
          <div className="flex items-center gap-1.5 text-white/85 text-[10px] font-black uppercase tracking-[0.15em]">
            <MaterialSymbol name="toll" size={13} className="text-amber-300" filled />
            <span>{t('yourCoinBalance')}</span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-1">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm font-mono">
              {formattedBalance}
            </span>
            <span className="text-sm sm:text-base font-black tracking-widest text-amber-300 uppercase">
              COINS
            </span>
          </div>
        </div>

        {/* Bottom Row: Quick Status & Usability Note */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-white/90 font-medium">
            <MaterialSymbol name="lock_open" size={14} className="text-pink-200" filled />
            <span>Instant & 100% usable for chats & calls</span>
          </div>

          {onAddCoins && (
            <button
              onClick={onAddCoins}
              className="px-3 py-1 rounded-xl bg-white text-pink-600 hover:bg-pink-50 font-black text-[11px] shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0"
            >
              <MaterialSymbol name="add" size={14} />
              <span>Top Up</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
