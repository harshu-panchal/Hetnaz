import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface CoinPurchaseHeaderProps {
  onHistoryClick?: () => void;
}

export const CoinPurchaseHeader = ({ onHistoryClick }: CoinPurchaseHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5 pt-4">
      <div className="flex items-center p-4 justify-between max-w-md mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-95"
          aria-label="Back"
        >
          <MaterialSymbol name="arrow_back" size={24} />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          {t('getCoins')}
        </h2>
        <button
          onClick={onHistoryClick}
          className="flex items-center justify-end px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-95"
        >
          <MaterialSymbol name="history" size={20} className="text-primary mr-1" />
          <p className="text-primary text-sm font-bold leading-normal">{t('history')}</p>
        </button>
      </div>
    </div>
  );
};

