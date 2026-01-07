import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { BottomNavigation } from '../components/BottomNavigation';
import { MaleTopNavbar } from '../components/MaleTopNavbar';
import { useMaleNavigation } from '../hooks/useMaleNavigation';
import type { Gift, GiftTransaction } from '../types/male.types';
import { useTranslation } from '../../../core/hooks/useTranslation';
import chatService from '../../../core/services/chat.service';
import { useGlobalState } from '../../../core/context/GlobalStateContext';

export const GiftsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { coinBalance } = useGlobalState();
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const [selectedTab, setSelectedTab] = useState<'send' | 'history'>('send');
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState('');

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [history, setHistory] = useState<GiftTransaction[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [availableGifts, giftHistory, activeChats] = await Promise.all([
        chatService.getAvailableGifts(),
        chatService.getGiftHistory(),
        chatService.getMyChatList()
      ]);

      setGifts(availableGifts.map((g: any) => ({
        id: g._id,
        name: g.name,
        cost: g.cost,
        description: g.description,
        category: g.category,
        imageUrl: g.imageUrl,
        icon: g.category === 'romantic' ? 'local_florist' :
          g.category === 'luxury' ? 'diamond' : 'redeem'
      })));

      setHistory(giftHistory.map((tx: any) => ({
        id: tx.id,
        giftName: tx.giftName,
        recipientId: tx.recipientId,
        recipientName: tx.recipientName,
        recipientAvatar: tx.recipientAvatar,
        sentAt: new Date(tx.sentAt).toLocaleString(),
        cost: tx.cost
      })));

      setRecipients(activeChats.map((c: any) => ({
        id: c._id,
        userId: c.otherUser?._id,
        name: c.otherUser?.name || 'User',
        avatar: c.otherUser?.avatar || ''
      })));

    } catch (error) {
      console.error('Failed to fetch gift data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendGift = async () => {
    if (selectedGift && selectedRecipient && !isSending) {
      try {
        setIsSending(true);
        const chat = recipients.find(r => r.id === selectedRecipient);
        if (!chat) return;

        await chatService.sendGift(chat.id, [selectedGift], giftMessage);

        setSelectedGift(null);
        setSelectedRecipient(null);
        setGiftMessage('');

        const updatedHistory = await chatService.getGiftHistory();
        setHistory(updatedHistory.map((tx: any) => ({
          id: tx.id,
          giftName: tx.giftName,
          recipientId: tx.recipientId,
          recipientName: tx.recipientName,
          recipientAvatar: tx.recipientAvatar,
          sentAt: new Date(tx.sentAt).toLocaleString(),
          cost: tx.cost
        })));

        alert(t('giftSentSuccess'));
      } catch (error) {
        console.error('Failed to send gift:', error);
        alert(t('giftSentError'));
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      <MaleTopNavbar />

      <header className="sticky top-[57px] z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
            aria-label="Go back"
          >
            <MaterialSymbol name="arrow_back" size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t('gifts')}</h1>
          <div className="size-10" />
        </div>
      </header>

      <div className="flex border-b border-gray-200 dark:border-white/5 mx-4 mt-4">
        <button
          onClick={() => setSelectedTab('send')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${selectedTab === 'send'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500 dark:text-gray-400'
            }`}
        >
          {t('sendGift')}
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${selectedTab === 'history'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500 dark:text-gray-400'
            }`}
        >
          {t('giftHistory')}
        </button>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">{t('loadingGiftData')}</p>
          </div>
        ) : selectedTab === 'send' ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MaterialSymbol name="monetization_on" className="text-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('coinBalance')}</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{coinBalance} {t('coins')}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('selectRecipient')}</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    onClick={() => setSelectedRecipient(recipient.id)}
                    className={`flex flex-col items-center gap-2 p-3 min-w-[100px] rounded-xl border-2 transition-all ${selectedRecipient === recipient.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#342d18]'
                      }`}
                  >
                    <img src={recipient.avatar} alt={recipient.name} className="w-12 h-12 rounded-full object-cover" />
                    <span className="text-xs font-medium text-slate-900 dark:text-white truncate w-full text-center">{recipient.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/male/discover')}
                className="mt-3 w-full py-2 text-sm text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors"
              >
                {t('browseMoreProfiles')}
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('selectGift')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {gifts.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => setSelectedGift(gift.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedGift === gift.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#342d18]'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {gift.imageUrl ? (
                        <img src={gift.imageUrl} alt={gift.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <MaterialSymbol
                          name={gift.icon as any}
                          size={40}
                          className={selectedGift === gift.id ? 'text-primary' : 'text-gray-400'}
                        />
                      )}
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{gift.name}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <MaterialSymbol name="monetization_on" size={16} className="text-primary" />
                        <span className="text-xs font-medium text-slate-900 dark:text-white">
                          {gift.cost} {t('coins')}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedGift && selectedRecipient && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('addMessageOptional')}</h3>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder={t('giftMessagePlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-[#342d18] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-gray-500">{giftMessage.length}/200</p>
              </div>
            )}

            {selectedGift && selectedRecipient && (
              <button
                onClick={handleSendGift}
                disabled={isSending}
                className={`w-full py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold rounded-xl transform transition-all duration-200 shadow-lg ${isSending ? 'opacity-70 cursor-not-allowed' : 'hover:from-pink-600 hover:to-pink-700 active:scale-95'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MaterialSymbol name="send" />
                  )}
                  <span>{isSending ? t('sending') : t('sendGift')}</span>
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <MaterialSymbol name="redeem" size={64} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t('noGiftsSentYet')}</p>
                <button
                  onClick={() => setSelectedTab('send')}
                  className="mt-4 px-6 py-2 bg-primary text-[#231d10] font-bold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  {t('sendFirstGift')}
                </button>
              </div>
            ) : (
              history.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={transaction.recipientAvatar}
                      alt={transaction.recipientName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {t('sentGiftTo', { gift: transaction.giftName, name: transaction.recipientName })}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.sentAt}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <MaterialSymbol name="monetization_on" size={16} className="text-primary" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {transaction.cost}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};

