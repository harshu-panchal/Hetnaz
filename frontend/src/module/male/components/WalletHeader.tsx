import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface WalletHeaderProps {
  onHelpClick?: () => void;
}

export const WalletHeader = ({ onHelpClick }: WalletHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 border-b border-black/5 dark:border-white/5 justify-center pt-4">
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#1a1a1a] text-slate-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 shadow-sm border border-black/5 dark:border-white/5"
          aria-label="Back"
        >
          <MaterialSymbol name="arrow_back" size={24} />
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight flex-1 text-center">
          {t('myWallet')}
        </h2>
        <div className="flex w-10 items-center justify-end">
          <button
            onClick={onHelpClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#1a1a1a] text-slate-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 shadow-sm border border-black/5 dark:border-white/5"
            aria-label="Help"
          >
            <MaterialSymbol name="help" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

