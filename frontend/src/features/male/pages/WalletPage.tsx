import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletHeader } from '../components/WalletHeader';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { SegmentedControls } from '../components/SegmentedControls';
import { TransactionItem } from '../components/TransactionItem';
import { BottomNavigation } from '../components/BottomNavigation';
import { HelpModal } from '../components/HelpModal';
import { QuickActionsModal } from '../components/QuickActionsModal';
import { MaterialSymbol } from '../types/material-symbol';
import type { Transaction } from '../types/male.types';

const navigationItems = [
  { id: 'discover', icon: 'explore', label: 'Discover' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats', hasBadge: true },
  { id: 'wallet', icon: 'monetization_on', label: 'Wallet', isActive: true },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

// Mock data - replace with actual API calls
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'purchase',
    title: 'Coins Purchased',
    timestamp: 'Today, 10:23 AM',
    amount: 1000,
    isPositive: true,
  },
  {
    id: '2',
    type: 'spent',
    title: 'Super Like sent to Sarah',
    timestamp: 'Yesterday, 8:45 PM',
    amount: 50,
    isPositive: false,
  },
  {
    id: '3',
    type: 'bonus',
    title: 'Daily Login Bonus',
    timestamp: '2 days ago',
    amount: 10,
    isPositive: true,
  },
  {
    id: '4',
    type: 'gift',
    title: 'Gift sent to Jessica',
    timestamp: 'Sep 12, 4:30 PM',
    amount: 200,
    isPositive: false,
  },
];

const quickActions = [
  {
    id: 'vip',
    icon: 'card_membership',
    label: 'Toki VIP',
    iconColor: 'text-primary',
    iconBgColor: 'bg-primary/10',
  },
  {
    id: 'gift',
    icon: 'redeem',
    label: 'Send Gift',
    iconColor: 'text-pink-500',
    iconBgColor: 'bg-pink-500/10',
  },
];

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'purchased', label: 'Purchased' },
  { id: 'spent', label: 'Spent' },
];

export const WalletPage = () => {
  const navigate = useNavigate();
  const [coinBalance] = useState(2450);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [quickActionId, setQuickActionId] = useState<'vip' | 'gift' | null>(null);
  const [userAvatar] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBoS_YLtV4hpNVbbyf0nrVmbQX6vzgn-xGLdye-t2gBz0LRib9HX4PeYJIj364IRM63hBRKmTLtWfuVOfikvNIryKKMjql6Ig1suPsbWoA45Vt8rO0N-wt7qwqIwMBV4Gaw6j7ooJER4L9QExcc20SNkyk1schLm-swXJOgx5ez3objGGhUPZpOMLYRY2W5WgHwClZhJ-JaWw470QybQVyCQD-hZYfamq_iJqx0EAJE0UNaa6Ee3_FbUUYSuUIIViQ_QxI6ytCepxc'
  );

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'all') {
      return mockTransactions;
    }
    if (selectedFilter === 'purchased') {
      return mockTransactions.filter((t) => t.type === 'purchase' || (t.isPositive && t.type !== 'bonus'));
    }
    if (selectedFilter === 'spent') {
      return mockTransactions.filter((t) => !t.isPositive);
    }
    return mockTransactions;
  }, [selectedFilter]);

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'discover':
        navigate('/discover');
        break;
      case 'chats':
        navigate('/chats');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'profile':
        navigate('/my-profile');
        break;
      default:
        break;
    }
  };

  const handleBuyCoins = () => {
    navigate('/buy-coins');
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'vip' || actionId === 'gift') {
      setQuickActionId(actionId);
      setIsQuickActionOpen(true);
    }
  };

  const handleHelpClick = () => {
    setIsHelpOpen(true);
  };

  const handleVipPurchase = () => {
    // TODO: Navigate to VIP purchase page or handle purchase
    console.log('VIP purchase');
  };

  const handleSendGift = () => {
    // TODO: Navigate to gift selection or handle gift sending
    console.log('Send gift');
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto shadow-xl bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <WalletHeader onHelpClick={handleHelpClick} />

      {/* Profile / Balance Header */}
      <div className="flex p-4 flex-col gap-6 items-center">
        {/* Hero Card */}
        <WalletBalanceCard
          balance={coinBalance}
          memberTier="Gold Member"
          userAvatar={userAvatar}
          valueEstimate="$24.50"
          expirationDays={30}
        />

        {/* Primary Action */}
        <div className="w-full">
          <button
            onClick={handleBuyCoins}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-primary hover:bg-primary/90 transition-colors text-[#231d10] gap-2 text-lg font-bold shadow-lg shadow-primary/20 active:scale-95"
          >
            <MaterialSymbol name="add_circle" size={24} />
            <span>Buy Coins</span>
          </button>
        </div>

        {/* Quick Actions Grid */}
        <QuickActionsGrid actions={quickActions} onActionClick={handleQuickAction} />
      </div>

      <div className="h-2 bg-transparent" />

      {/* Transaction History Header */}
      <div className="px-4">
        <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-3">
          Transaction History
        </h3>
      </div>

      {/* Segmented Controls */}
      <div className="px-4 pb-4">
        <SegmentedControls
          options={filterOptions}
          selectedOption={selectedFilter}
          onOptionChange={setSelectedFilter}
        />
      </div>

      {/* Transaction List */}
      <div className="flex flex-col pb-24">
        {filteredTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            id={transaction.id}
            type={transaction.type}
            title={transaction.title}
            timestamp={transaction.timestamp}
            amount={transaction.amount}
            isPositive={transaction.isPositive}
          />
        ))}
        <div className="h-4" />
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Quick Actions Modal */}
      {quickActionId && (
        <QuickActionsModal
          isOpen={isQuickActionOpen}
          onClose={() => {
            setIsQuickActionOpen(false);
            setQuickActionId(null);
          }}
          actionId={quickActionId}
          onVipPurchase={handleVipPurchase}
          onSendGift={handleSendGift}
        />
      )}
    </div>
  );
};
