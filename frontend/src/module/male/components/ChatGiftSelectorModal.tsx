import { useState, useEffect } from 'react';
import { MaterialSymbol } from '../types/material-symbol';
import walletService from '../../../core/services/wallet.service';

interface Gift {
  _id: string;
  name: string;
  category: string;
  imageUrl: string;
  cost: number;
  description?: string;
}

interface ChatGiftSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendGift: (giftId: string) => void;
  coinBalance: number;
}

export const ChatGiftSelectorModal = ({
  isOpen,
  onClose,
  onSendGift,
  coinBalance,
}: ChatGiftSelectorModalProps) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch gifts on mount
  useEffect(() => {
    if (isOpen) {
      fetchGifts();
    }
  }, [isOpen]);

  const fetchGifts = async () => {
    try {
      setIsLoading(true);
      const data = await walletService.getGifts();
      setGifts(data.gifts || []);
    } catch (err) {
      console.error('Failed to fetch gifts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getSelectedGiftData = (): Gift | undefined => {
    return gifts.find((gift) => gift._id === selectedGift);
  };

  const selectedGiftData = getSelectedGiftData();
  const canSend = selectedGift && coinBalance >= (selectedGiftData?.cost || 0);

  const handleSend = async () => {
    if (selectedGift && canSend && !isSending) {
      setIsSending(true);
      try {
        await onSendGift(selectedGift);
        setSelectedGift(null);
      } finally {
        setIsSending(false);
      }
    }
  };

  // Get icon based on category
  const getGiftIcon = (category: string) => {
    switch (category) {
      case 'romantic': return '❤️';
      case 'funny': return '😂';
      case 'celebration': return '🎉';
      case 'appreciation': return '🙏';
      case 'special': return '⭐';
      default: return '🎁';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#2f151e] rounded-t-3xl shadow-2xl safe-area-inset-bottom max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Send Gift 🎁</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
              aria-label="Close"
            >
              <MaterialSymbol name="close" size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Coin Balance */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Your Balance</span>
              <div className="flex items-center gap-1">
                <span className="text-lg">🪙</span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                  {(coinBalance || 0).toLocaleString()} coins
                </span>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Gift Selection */}
          {!isLoading && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Choose a Gift
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {gifts.map((gift) => {
                  const isSelected = selectedGift === gift._id;
                  const canAfford = coinBalance >= gift.cost;
                  return (
                    <button
                      key={gift._id}
                      onClick={() => canAfford && setSelectedGift(gift._id)}
                      disabled={!canAfford}
                      className={`p-4 rounded-xl border-2 transition-all ${isSelected
                        ? 'border-primary bg-primary/10 scale-105'
                        : canAfford
                          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#342d18] hover:border-primary/50'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50'
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {gift.imageUrl ? (
                          <img src={gift.imageUrl} alt={gift.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <span className="text-3xl">{getGiftIcon(gift.category)}</span>
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {gift.name}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                          <span className="text-sm">🪙</span>
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            {gift.cost}
                          </span>
                        </div>
                        {!canAfford && (
                          <span className="text-[10px] text-red-500">Not enough coins</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {gifts.length === 0 && !isLoading && (
                <p className="text-center text-gray-500 py-8">No gifts available</p>
              )}
            </div>
          )}
        </div>

        {/* Footer - Selected Gift Summary & Send Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#2f151e]">
          {selectedGiftData && (
            <div className="mb-3 p-3 bg-primary/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getGiftIcon(selectedGiftData.category)}</span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedGiftData.name}</p>
                  {selectedGiftData.description && (
                    <p className="text-xs text-gray-500">{selectedGiftData.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">🪙</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  {selectedGiftData.cost}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!canSend || isSending}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center gap-2">
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <MaterialSymbol name="redeem" />
                  <span>
                    {selectedGift ? `Send ${selectedGiftData?.name}` : 'Select a Gift'}
                  </span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
