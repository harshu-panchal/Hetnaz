import { MaterialSymbol } from '../types/material-symbol';
import type { NearbyFemale } from '../types/male.types';

interface ProfileCardProps {
  profile: NearbyFemale;
  onChatClick?: (profileId: string) => void;
  onProfileClick?: (profileId: string) => void;
}

export const ProfileCard = ({ profile, onChatClick, onProfileClick }: ProfileCardProps) => {
  const isPrimaryButton = profile.isOnline || profile.bio?.includes('New here');

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the chat button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onProfileClick?.(profile.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#342d18] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <img
        alt={`${profile.name} profile picture`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        src={profile.avatar}
      />

      {/* Distance Badge */}
      <div className="absolute top-3 left-3 flex gap-2">
        <div className="flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2 py-1">
          <MaterialSymbol name="location_on" size={12} className="text-white" />
          <span className="text-[10px] font-bold text-white">{profile.distance}</span>
        </div>
      </div>

      {/* Online Status Badge */}
      {profile.isOnline && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 rounded-full bg-green-500/90 backdrop-blur-sm px-2 py-1 shadow-sm">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              Online
            </span>
          </div>
        </div>
      )}

      {/* Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-12">
        <div className="mb-1">
          <h3 className="text-lg font-bold leading-tight text-white">
            {profile.name}, {profile.age}
          </h3>
          <p className="text-xs font-medium text-gray-300">
            {profile.occupation || profile.bio || 'Looking for connections'}
          </p>
        </div>

        {/* Chat Button */}
        <button
          onClick={() => onChatClick?.(profile.id)}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white transition-all active:scale-95 ${
            isPrimaryButton
              ? 'bg-primary hover:bg-yellow-400 shadow-lg shadow-primary/20'
              : 'bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/10'
          }`}
        >
          <MaterialSymbol name="chat_bubble" size={18} />
          <span>Chat</span>
          <div
            className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] ${
              isPrimaryButton ? 'bg-white/20' : 'bg-black/20'
            }`}
          >
            <MaterialSymbol name="monetization_on" size={10} />
            <span>{profile.chatCost}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

