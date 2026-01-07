interface ProfileHeaderProps {
  user: {
    name: string;
    avatar: string;
    isPremium: boolean;
    isOnline: boolean;
  };
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 pt-8">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-16 w-16 border-2 border-primary"
            style={{ backgroundImage: `url("${user.avatar}")` }}
            aria-label={`${user.name}'s profile avatar`}
          />
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-background-light dark:border-background-dark" />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            Hello, {user.name}
          </p>
          <p className="text-slate-500 dark:text-[#cbbc90] text-sm font-medium leading-normal">
            {user.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
    </div>
  );
};


