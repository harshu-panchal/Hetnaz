import { useState } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionId: 'vip' | 'gift';
  onVipPurchase?: () => void;
  onSendGift?: (userId?: string) => void;
}

export const QuickActionsModal = ({
  isOpen,
  onClose,
  actionId,
  onVipPurchase,
  onSendGift,
}: QuickActionsModalProps) => {
  const [selectedGift, setSelectedGift] = useState<string | null>(null);

  if (!isOpen) return null;

  const gifts = [
    { id: '1', name: 'Rose', icon: 'local_florist', cost: 50 },
    { id: '2', name: 'Chocolate', icon: 'cake', cost: 100 },
    { id: '3', name: 'Diamond', icon: 'diamond', cost: 500 },
    { id: '4', name: 'Heart', icon: 'favorite', cost: 200 },
  ];

  const vipPlans = [
    { id: '1', name: 'Silver VIP', price: 299, duration: '1 month', benefits: ['10% discount on messages', 'Priority support'] },
    { id: '2', name: 'Gold VIP', price: 499, duration: '1 month', benefits: ['20% discount on messages', 'Priority support', 'Exclusive badges'] },
    { id: '3', name: 'Platinum VIP', price: 999, duration: '1 month', benefits: ['30% discount on messages', 'Priority support', 'Exclusive badges', 'Free gifts'] },
  ];

  const handleAction = () => {
    if (actionId === 'vip') {
      onVipPurchase?.();
    } else if (actionId === 'gift' && selectedGift) {
      onSendGift?.();
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#2f151e] rounded-t-3xl shadow-2xl photo-picker-slide-up safe-area-inset-bottom max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#2f151e] border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {actionId === 'vip' ? 'MatchMint VIP Membership' : 'Send Gift'}
            </h2>
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
        <div className="p-4 space-y-4">
          {actionId === 'vip' ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unlock exclusive benefits with VIP membership
              </p>
              <div className="space-y-3">
                {vipPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 bg-gray-50 dark:bg-[#342d18] rounded-xl border-2 border-transparent hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.duration}</p>
                      </div>
                      <span className="text-lg font-bold text-primary">₹{plan.price}</span>
                    </div>
                    <ul className="space-y-1 mt-3">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MaterialSymbol name="check_circle" size={16} className="text-primary" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        onVipPurchase?.();
                        onClose();
                      }}
                      className="w-full mt-3 h-10 bg-primary text-[#231d10] font-semibold rounded-lg hover:bg-primary/90 transition-colors active:scale-95"
                    >
                      Subscribe
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a gift to send to show your appreciation
              </p>
              <div className="grid grid-cols-2 gap-3">
                {gifts.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => setSelectedGift(gift.id)}
                    className={`p-4 rounded-xl border-2 transition-all active:scale-95 ${
                      selectedGift === gift.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#342d18]'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <MaterialSymbol
                        name={gift.icon as any}
                        size={32}
                        className={selectedGift === gift.id ? 'text-primary' : 'text-gray-400'}
                      />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {gift.name}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {gift.cost} coins
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {selectedGift && (
                <button
                  onClick={handleAction}
                  className="w-full h-12 bg-primary text-[#231d10] font-semibold rounded-xl hover:bg-primary/90 transition-colors active:scale-95"
                >
                  Send Gift
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};



