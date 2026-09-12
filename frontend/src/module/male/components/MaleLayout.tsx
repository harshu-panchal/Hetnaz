import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { PageSkeletonLoader } from './PageSkeletonLoader';
import { useMaleNavigation } from '../hooks/useMaleNavigation';

export const MaleLayout: React.FC = () => {
  const { navigationItems, handleNavigationClick } = useMaleNavigation();
  const location = useLocation();

  // Hide bottom navigation on dedicated full-screen sub-routes:
  // 1. Active chat window (/male/chat/:chatId, but NOT /male/chats)
  // 2. Female profile detail page (/male/profile/:id)
  const isChatWindow =
    location.pathname.startsWith('/male/chat/') &&
    !location.pathname.startsWith('/male/chats');

  const isProfileView = location.pathname.startsWith('/male/profile/');
  const isBuyCoins = location.pathname === '/male/buy-coins';
  const isEditProfile = location.pathname === '/male/edit-profile';

  const hideBottomNav = isChatWindow || isProfileView || isBuyCoins || isEditProfile;

  return (
    <div className="min-h-screen relative w-full bg-background-light">
      <Suspense fallback={<PageSkeletonLoader />}>
        <Outlet />
      </Suspense>

      {!hideBottomNav && (
        <BottomNavigation
          items={navigationItems}
          onItemClick={handleNavigationClick}
        />
      )}
    </div>
  );
};
