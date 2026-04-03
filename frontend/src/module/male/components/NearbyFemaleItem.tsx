import React from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { DiscoverProfile } from '../../../core/services/user.service';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface NearbyFemaleItemProps {
  profile: DiscoverProfile;
  onChatClick: (id: string, name: string) => void;
  onProfileClick: (id: string) => void;
  isSendingHi?: boolean;
}

export const NearbyFemaleItem: React.FC<NearbyFemaleItemProps> = ({ 
  profile, 
  onChatClick, 
  onProfileClick,
  isSendingHi 
}) => {
  const { t } = useTranslation();

  return (
    <div 
      onClick={() => onProfileClick(profile.id)}
      className="skeuo-card rounded-[2rem] p-3 flex items-center gap-4 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all mb-4 overflow-hidden relative group"
    >
      {/* 1. Left: Girl Image */}
      <div className="relative shrink-0">
        <div className="skeuo-inset p-1 rounded-2xl">
          <img
            src={profile.avatar || 'https://via.placeholder.com/80?text=?'}
            alt={profile.name}
            className="h-20 w-20 rounded-xl object-cover shadow-sm"
          />
        </div>
        {profile.isOnline && (
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        )}
      </div>

      {/* 2. Center: Info Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
        {/* Name */}
        <h3 className="text-xl font-black text-gray-900 truncate tracking-tight mb-0.5">
          {profile.name}
        </h3>

        {/* Age */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[13px] font-black text-gray-500 uppercase tracking-tighter">
            {profile.age} {t('YRS')}
          </span>
        </div>

        {/* Bio or Distance */}
        <div className="flex items-center gap-1.5 text-gray-400">
          <p className="text-[12px] font-medium truncate leading-tight">
            {profile.bio || profile.distance || t('Nearby')}
          </p>
        </div>
      </div>

      {/* 3. Right: CHAT Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChatClick(profile.id, profile.name);
        }}
        disabled={isSendingHi}
        className="bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-[0_8px_16px_rgba(249,115,22,0.25)] active:scale-95 px-5 py-3 rounded-[1.25rem] flex flex-col items-center justify-center min-w-[75px] gap-1 group/btn transition-all relative overflow-hidden"
      >
        {isSendingHi ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <MaterialSymbol name="chat_bubble" size={24} filled className="text-white group-hover/btn:scale-110 transition-transform duration-300 relative z-10" />
            <span className="text-[10px] font-black uppercase tracking-widest relative z-10 text-white/90">{t('CHAT') || 'CHAT'}</span>
          </>
        )}
      </button>

      {/* Subtle Shine Overlay */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </div>
  );
};
