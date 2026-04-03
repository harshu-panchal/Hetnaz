import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface NearbyUser {
  id: string;
  avatar: string;
  name: string;
}

interface DiscoverNearbyCardProps {
  nearbyUsers: NearbyUser[];
  onExploreClick?: () => void;
}

export const DiscoverNearbyCard = ({ nearbyUsers, onExploreClick }: DiscoverNearbyCardProps) => {
  const { t } = useTranslation();
  const displayedUsers = nearbyUsers.slice(0, 2);
  const remainingCount = nearbyUsers.length > 2 ? nearbyUsers.length - 2 : 0;

  return (
    <div className="p-4 mt-2">
      {/* Premium Container with Mesh & Glow */}
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-premium-pink shadow-2xl transition-all duration-700 hover:shadow-pink-500/20">
        <div className="absolute inset-0 bg-mesh-glass opacity-40 pointer-events-none" />
        
        {/* Animated Accent Blobs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 blur-3xl rounded-full animate-pulse-slow" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-400/30 blur-3xl rounded-full animate-pulse-slow" style={{ animationDelay: '-2s' }} />

        <div className="relative flex items-center justify-between gap-4 p-7">
          <div className="flex flex-[2_2_0px] flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="skeuo-inset size-8 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md">
                   <MaterialSymbol name="location_on" size={18} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" filled />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-80">
                  {t('discoverNearbyTitle')}
                </h3>
              </div>
              <p className="text-2xl font-black text-white leading-tight tracking-tighter drop-shadow-sm">
                {t('Find people in your circle')}
              </p>
            </div>
            
            <button
              onClick={onExploreClick}
              className="skeuo-button w-fit h-11 px-6 rounded-2xl flex items-center gap-2 bg-white/95 backdrop-blur-md border-white/50 active:scale-95 transition-all group"
            >
              <span className="text-xs font-bold text-slate-900 capitalize tracking-wide">{t('exploreButton')}</span>
              <MaterialSymbol name="arrow_forward" size={16} className="text-slate-900 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Optimized Avatar Stack */}
          <div className="flex flex-1 items-center justify-end -space-x-4">
            {displayedUsers.map((user, i) => (
              <div
                key={user.id}
                className="group/avatar relative"
                style={{ zIndex: 10 - i }}
              >
                  <div 
                    className="h-16 w-16 rounded-full skeuo-card p-1 bg-white/40 dark:bg-black/10 backdrop-blur-md hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl"
                  >
                    <div 
                      className="w-full h-full rounded-full bg-cover bg-center border-2 border-white/60"
                      style={{ backgroundImage: `url("${user.avatar}")` }}
                    />
                  </div>
              </div>
            ))}
            {remainingCount > 0 && (
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-full skeuo-card bg-white/20 backdrop-blur-md text-[10px] font-black text-white shadow-lg border-white/40 relative z-0"
              >
                +{remainingCount}
              </div>
            )}
          </div>
        </div>
        
        {/* Subtle Bottom Border Reflection */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
    </div>
  );
};
