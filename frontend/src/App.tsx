import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MaleDashboard } from './module/male/pages/MaleDashboard';
import { NearbyFemalesPage } from './module/male/pages/NearbyFemalesPage';
import { ChatListPage as MaleChatListPage } from './module/male/pages/ChatListPage';
import { ChatWindowPage as MaleChatWindowPage } from './module/male/pages/ChatWindowPage';
import { WalletPage } from './module/male/pages/WalletPage';
import { CoinPurchasePage } from './module/male/pages/CoinPurchasePage';
import { UserProfilePage } from './module/male/pages/UserProfilePage';
import { NotificationsPage as MaleNotificationsPage } from './module/male/pages/NotificationsPage';
import { PurchaseHistoryPage } from './module/male/pages/PurchaseHistoryPage';
import { PaymentPage } from './module/male/pages/PaymentPage';
import { MyProfilePage as MaleMyProfilePage } from './module/male/pages/MyProfilePage';

// Female module imports
import { FemaleDashboard } from './module/female/pages/FemaleDashboard';
import { ChatListPage as FemaleChatListPage } from './module/female/pages/ChatListPage';
import { ChatWindowPage as FemaleChatWindowPage } from './module/female/pages/ChatWindowPage';
import { EarningsPage } from './module/female/pages/EarningsPage';
import { WithdrawalPage } from './module/female/pages/WithdrawalPage';
import { AutoMessageTemplatesPage } from './module/female/pages/AutoMessageTemplatesPage';
import { MyProfilePage as FemaleMyProfilePage } from './module/female/pages/MyProfilePage';
import { NotificationsPage as FemaleNotificationsPage } from './module/female/pages/NotificationsPage';
import { UserProfilePage as FemaleUserProfilePage } from './module/female/pages/UserProfilePage';

// Common pages
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Male Routes */}
        <Route path="/" element={<MaleDashboard />} />
        <Route path="/dashboard" element={<MaleDashboard />} />
        <Route path="/discover" element={<NearbyFemalesPage />} />
        <Route path="/chats" element={<MaleChatListPage />} />
        <Route path="/chat/:chatId" element={<MaleChatWindowPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/buy-coins" element={<CoinPurchasePage />} />
        <Route path="/profile/:profileId" element={<UserProfilePage />} />
        <Route path="/notifications" element={<MaleNotificationsPage />} />
        <Route path="/purchase-history" element={<PurchaseHistoryPage />} />
        <Route path="/payment/:planId" element={<PaymentPage />} />
        <Route path="/my-profile" element={<MaleMyProfilePage />} />

        {/* Female Routes */}
        <Route path="/female/dashboard" element={<FemaleDashboard />} />
        <Route path="/female/chats" element={<FemaleChatListPage />} />
        <Route path="/female/chat/:chatId" element={<FemaleChatWindowPage />} />
        <Route path="/female/earnings" element={<EarningsPage />} />
        <Route path="/female/withdrawal" element={<WithdrawalPage />} />
        <Route path="/female/auto-messages" element={<AutoMessageTemplatesPage />} />
        <Route path="/female/my-profile" element={<FemaleMyProfilePage />} />
        <Route path="/female/notifications" element={<FemaleNotificationsPage />} />
        <Route path="/female/profile/:profileId" element={<FemaleUserProfilePage />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
