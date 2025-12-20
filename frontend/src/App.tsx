import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import { SocketProvider } from './core/context/SocketContext';
import { GlobalStateProvider } from './core/context/GlobalStateContext';
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
import { MaleProfileEditPage } from './module/male/pages/MaleProfileEditPage';
import { GiftsPage } from './module/male/pages/GiftsPage';
import { BadgesPage } from './module/male/pages/BadgesPage';

import { ProtectedRoute } from './core/components/ProtectedRoute';

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
import { GiftTradingPage } from './module/female/pages/GiftTradingPage';
import { GiftTradeFlowPage } from './module/female/pages/GiftTradeFlowPage';

// Admin module imports
import { AdminDashboard } from './module/admin/pages/AdminDashboard';
import { AdminLoginPage } from './module/admin/pages/AdminLoginPage';
import { UsersManagementPage } from './module/admin/pages/UsersManagementPage';
import { UserDetailPage } from './module/admin/pages/UserDetailPage';
import { FemaleApprovalPage } from './module/admin/pages/FemaleApprovalPage';
import { FemaleApprovalDetailPage } from './module/admin/pages/FemaleApprovalDetailPage';
import { RejectApprovalPage } from './module/admin/pages/RejectApprovalPage';
import { WithdrawalManagementPage } from './module/admin/pages/WithdrawalManagementPage';
import { RejectWithdrawalPage } from './module/admin/pages/RejectWithdrawalPage';
import { CoinEconomyPage } from './module/admin/pages/CoinEconomyPage';
import { TransactionsPage } from './module/admin/pages/TransactionsPage';
import { AuditLogsPage } from './module/admin/pages/AuditLogsPage';
import { SettingsPage } from './module/admin/pages/SettingsPage';

// Common pages
import { NotFoundPage } from './pages/NotFoundPage';

// Auth pages
import { SignupPage } from './module/auth/pages/SignupPage';
import { LoginPage } from './module/auth/pages/LoginPage';
import { OtpVerificationPage } from './module/auth/pages/OtpVerificationPage';
import { VerificationPendingPage } from './module/auth/pages/VerificationPendingPage';
import { BasicProfilePage } from './module/auth/pages/BasicProfilePage';
import { InterestsPage } from './module/auth/pages/InterestsPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <GlobalStateProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing page → default to Discover */}
              <Route path="/" element={<Navigate to="/male/discover" replace />} />

              {/* Auth routes */}
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/otp-verification" element={<OtpVerificationPage />} />
              <Route path="/verification-pending" element={<VerificationPendingPage />} />
              <Route path="/onboarding/basic-profile" element={<BasicProfilePage />} />
              <Route path="/onboarding/interests" element={<InterestsPage />} />

              {/* Male Routes */}
              <Route path="/male/dashboard" element={<MaleDashboard />} />
              <Route path="/male/discover" element={<NearbyFemalesPage />} />
              <Route path="/male/chats" element={<MaleChatListPage />} />
              <Route path="/male/chat/:chatId" element={<MaleChatWindowPage />} />
              <Route path="/male/wallet" element={<WalletPage />} />
              <Route path="/male/buy-coins" element={<CoinPurchasePage />} />
              <Route path="/male/profile/:profileId" element={<UserProfilePage />} />
              <Route path="/male/notifications" element={<MaleNotificationsPage />} />
              <Route path="/male/purchase-history" element={<PurchaseHistoryPage />} />
              <Route path="/male/payment/:planId" element={<PaymentPage />} />
              <Route path="/male/my-profile" element={<MaleMyProfilePage />} />
              <Route path="/male/my-profile/profile" element={<MaleProfileEditPage />} />
              <Route path="/male/gifts" element={<GiftsPage />} />
              <Route path="/male/badges" element={<BadgesPage />} />

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
              <Route path="/female/trade-gifts" element={<GiftTradingPage />} />
              <Route path="/female/trade-gifts/flow" element={<GiftTradeFlowPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UsersManagementPage />} />
                <Route path="/admin/users/:userId" element={<UserDetailPage />} />
                <Route path="/admin/female-approval" element={<FemaleApprovalPage />} />
                <Route path="/admin/female-approval/:userId" element={<FemaleApprovalDetailPage />} />
                <Route path="/admin/female-approval/reject/:userId" element={<RejectApprovalPage />} />
                <Route path="/admin/withdrawals" element={<WithdrawalManagementPage />} />
                <Route path="/admin/withdrawals/reject/:requestId" element={<RejectWithdrawalPage />} />
                <Route path="/admin/coin-economy" element={<CoinEconomyPage />} />
                <Route path="/admin/transactions" element={<TransactionsPage />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </GlobalStateProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
