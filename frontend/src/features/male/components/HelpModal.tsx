import { useState } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'How do I add coins to my wallet?',
    answer:
      'You can purchase coins by going to the Buy Coins page. Select a plan that suits you and complete the payment using Razorpay.',
  },
  {
    id: '2',
    question: 'How much do messages cost?',
    answer:
      'Message costs vary based on your membership tier. Basic tier costs 20 coins per message, while higher tiers offer discounts.',
  },
  {
    id: '3',
    question: 'How do I withdraw coins?',
    answer:
      'Coin withdrawal is available for female users only. Male users can use coins to send messages and gifts.',
  },
  {
    id: '4',
    question: 'What happens if my payment fails?',
    answer:
      'If your payment fails, no coins will be deducted. You can try the payment again or contact support for assistance.',
  },
  {
    id: '5',
    question: 'Can I get a refund?',
    answer:
      'Refunds are handled on a case-by-case basis. Please contact our support team for refund requests.',
  },
];

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Help & Support</h2>
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
          {/* FAQ Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {faqItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-[#342d18] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="flex-1 font-medium text-slate-900 dark:text-white pr-2">
                      {item.question}
                    </span>
                    <MaterialSymbol
                      name={expandedId === item.id ? 'expand_less' : 'expand_more'}
                      size={24}
                      className="text-gray-400 shrink-0"
                    />
                  </button>
                  {expandedId === item.id && (
                    <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Still need help?</h3>
            <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors active:scale-95">
              <div className="flex items-center justify-center size-10 rounded-full bg-primary/20">
                <MaterialSymbol name="support_agent" size={24} className="text-primary" />
              </div>
              <span className="flex-1 text-left font-medium text-slate-900 dark:text-white">
                Contact Support
              </span>
              <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


