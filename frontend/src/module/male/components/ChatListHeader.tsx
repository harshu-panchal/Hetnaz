import { useTranslation } from '../../../core/hooks/useTranslation';

interface ChatListHeaderProps {
}

export const ChatListHeader = ({ }: ChatListHeaderProps) => {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark z-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('chats')}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Header actions can go here */}
      </div>
    </header>
  );
};

