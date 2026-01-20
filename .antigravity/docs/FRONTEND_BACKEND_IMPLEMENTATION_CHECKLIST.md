# MatchMint – Frontend/Backend Implementation Checklist (Sujal & Harsh)

> **Goal**: End‑to‑end plan of **all required logics** (frontend + backend) for each workflow, with clear **ownership** (Sujal vs Harsh) and minimal conflicts, designed using **BMAD (Build → Model → Act → Deploy)** principles.
>
> **Legend**
> - `→` : Flow/arrow notation (who calls what)
> - **[API]**: Backend endpoint to implement
> - **[SERVICE]**: Backend business logic
> - **[SOCKET]**: Real‑time event
> - **[FE]**: Frontend logic/state
> - **[DB]**: MongoDB schema/queries
> - **[H]**: Harsh owns
> - **[S]**: Sujal owns

---

## 0. Global Infrastructure & Shared Foundations

- [ ] **0.1 Backend project setup** **[S]**
  - Node + Express app skeleton
  - Common middlewares: `cors`, `helmet`, JSON parser, error handler
  - Env loading (`dotenv`) and config module

- [ ] **0.2 MongoDB Atlas integration** **[S]**
  - Connection helper (`mongoose.connect`)
  - Retry & logging on connection failure
  - Separate dev/test/prod DB names

- [ ] **0.3 Base models (shared)** **[S primary, H reviews for chat fields]**
  - **User**: auth + profile + role + wallet snapshot fields
  - **Transaction**: generic credits/debits (coins)
  - **CoinPlan**: plans for purchase
  - **Withdrawal**: withdrawal requests
  - **AuditLog**: admin actions
  - **Notification**: generic notification entries

- [ ] **0.4 Error & response utilities** **[S]**
  - Standard API response shape: `{ success, data, error }`
  - Central error handler, error classes

- [ ] **0.5 Auth middleware & RBAC** **[S]**
  - JWT issue/verify
  - `requireAuth`, `requireRole('male'|'female'|'admin')`

- [ ] **0.6 Socket.IO server setup** **[H]**
  - Attach Socket.IO to HTTP server
  - Auth handshake (token → user)
  - User online status tracking

- [ ] **0.7 BMAD Base Layout (Backend)** **[S]**
  - `/models` → Mongoose schemas + TypeScript interfaces (domain models)
  - `/actions` → pure business logic functions operating on models
  - `/adapters` → Express route handlers, Socket.IO handlers, Razorpay client, MongoDB connection
  - `/workflows` → composed sequences (e.g. “send paid message”, “approve withdrawal”)
  - `/config` → env + constants (e.g. MESSAGE_COST, CALL_COST)
  - Ensure **no business rules** live only in adapters (routes/controllers)

---

## 1. Authentication & Onboarding (Login, Signup, Basic Profile)

### 1.1 Flows (Arrow Notation)

**Signup**
- **FE** `SignupPage` (form submit) **[S]**
  → **[API][S]** `POST /api/auth/signup`
  → **[SERVICE][S]** `authService.createUser`
  → **[DB][S]** insert `User`, initial wallet = 0, role = male/female
  → returns JWT + basic user

**Login**
- **FE** `LoginPage` (form submit) **[S]**
  → **[API][S]** `POST /api/auth/login`
  → **[SERVICE][S]** `authService.login`
  → **[DB][S]** find user, verify password
  → returns JWT + user role

**Basic Profile Setup**
- **FE** `BasicProfilePage`, `InterestsPage`, `PreferencesPage` **[S]**
  → **[API][S]** `PUT /api/profile/basic`
  → **[SERVICE][S]** `profileService.updateBasicProfile`
  → **[DB][S]** update profile fields

### 1.2 Checklist

- [ ] Auth endpoints: signup/login/logout/refresh **[S]**
- [ ] Password hashing (bcrypt) **[S]**
- [ ] JWT generation & verification **[S]**
- [ ] Profile completion tracking flag on `User` **[S]**
- [ ] Frontend auth context/store **[S]**
- [ ] Route guards per role (male/female/admin) **[S]**
- [ ] **BMAD Models** **[S]**
  - `AuthCredentials`, `AuthTokenPayload`, `UserProfile`, `Role` enums
  - Zod/Yup validation schemas for signup/login/profile update
- [ ] **BMAD Actions** **[S]**
  - `registerUser(model: SignupModel) → AuthResult`
  - `loginUser(model: LoginModel) → AuthResult`
  - `updateBasicProfile(model: ProfileModel) → UpdatedProfile`
  - Pre-conditions: unique email, password strength; Post-conditions: user + token issued
- [ ] **Error & edge cases** **[S]**
  - Duplicate email / phone
  - Weak password, invalid OTP (if added later)
  - Rate limiting for login
  - Locked/blocked user login attempts

---

## 2. Male Module – Dashboards, Discovery, Wallet, Chat Entry

> **Rule**: **Harsh** handles **chat/gifts/video‑call + chat‑related coin movement**, **Sujal** handles everything else.

### 2.1 Male Dashboard Workflow

**Flow**
- **FE** `MaleDashboard.tsx` load **[S]**
  → **[API][S]** `GET /api/male/dashboard`
  → **[SERVICE][S]** `maleDashboardService.buildDashboardData`
  → **[DB][S]**:
    - Fetch user profile, wallet, badges, stats, nearby preview
  → **[DB][H]** (via service call): last chats/messages summary

### 2.1 Checklist

- [ ] **[API][S]** `GET /api/male/dashboard`
- [ ] **[SERVICE][S]** aggregate:
  - [ ] Total matches, messages sent, profile views
  - [ ] Wallet balance, member tier
  - [ ] Nearby females preview (from discovery service)
  - [ ] Active chats preview via **chat service** **[H]**
- [ ] **[H]** chat service helper: `chatService.getActiveChatsForDashboard(userId)`
- [ ] **[FE][S]** integrate live API instead of mock
- [ ] **BMAD Models** **[S]**
  - `MaleDashboardData`, `StatCard`, `NearbyProfilePreview`, `ActiveChatSummary`
- [ ] **BMAD Actions** **[S+H]**
  - `buildMaleDashboard(userId) → MaleDashboardData` (composes wallet, discovery, chat summaries)
  - Pre-conditions: user role = male, authenticated
  - Post-conditions: no partial sections; empty arrays instead of nulls
- [ ] **Edge cases & subfeatures** **[S+H]**
  - Graceful empty states: no chats, no nearby users, zero balance
  - Fallback when chat service is temporarily unavailable (skip active chats but still return dashboard)
  - Caching layer for expensive stats (e.g. profile views count)

---

### 2.2 Discovery / Nearby Females

**Flow**
- **FE** `NearbyFemalesPage.tsx` (filters/search) **[S]**
  → **[API][S]** `GET /api/male/discover?ageRange&distance&online&verified&search`
  → **[SERVICE][S]** `discoveryService.searchFemales`
  → **[DB][S]** query `User` (role=female), use location to compute distance (not restricting, only display)

### 2.2 Checklist

- [ ] Discovery query builder with filters **[S]**
- [ ] Distance computation helper (Haversine) **[S]**
- [ ] Pagination / infinite scroll support **[S]**
- [ ] FE wiring for filters & search **[S]**
- [ ] **BMAD Models** **[S]**
  - `DiscoveryFilterModel` (ageRange, distance, online, verified, search)
  - `DiscoveryResult` (profiles[], total, page, pageSize)
- [ ] **BMAD Actions** **[S]**
  - `searchFemales(userId, filters: DiscoveryFilterModel) → DiscoveryResult`
  - `rankProfilesByRelevance(profiles, filters) → profiles[]`
- [ ] **Edge cases & subfeatures** **[S]**
  - Handle missing location for some users (distance = null, sort last)
  - Protection against too-wide queries (max radius, max page size)
  - Consistent ordering for pagination to avoid duplicates/skips
  - Safe default filters if FE sends nothing

---

### 2.3 Male Wallet & Transactions (Non‑Chat)

**Wallet Screen Flow**
- **FE** `WalletPage.tsx` **[S]**
  → **[API][S]** `GET /api/male/wallet`
  → **[SERVICE][S]** `walletService.getWalletOverview(maleUserId)`
  → **[DB][S]** aggregate balance + transactions summary

**Transactions Filter**
- **FE** wallet segmented controls **[S]**
  → **[API][S]** `GET /api/male/transactions?type=all|purchased|spent`
  → **[SERVICE][S]** filter Transaction history

### 2.3 Checklist

- [ ] Wallet aggregation (balance + last N transactions) **[S]**
- [ ] Transaction model enums for types: purchase, message_spent, video_call_spent, gift_spent, bonus, adjustment **[S]**
- [ ] FE integration for filters & pagination **[S]**
- [ ] **BMAD Models** **[S]**
  - `WalletSnapshot`, `TransactionRecord`, `TransactionFilter`
- [ ] **BMAD Actions** **[S]**
  - `getWalletOverview(userId) → WalletSnapshot`
  - `listTransactions(userId, filter: TransactionFilter) → Paginated<TransactionRecord>`
  - `applyTransaction(userId, deltaCoins, type, metadata) → WalletSnapshot`
- [ ] **Safety & subfeatures** **[S]**
  - Double-write protection: ensure no duplicate Transaction records for same external event
  - Consistent coin balance by always deriving from authoritative ledger, or by atomic updates
  - Server-side validation of filter types instead of trusting FE

---

### 2.4 Coin Purchase → Payment → Balance Update

**Plan Selection**
- **FE** `CoinPurchasePage.tsx` **[S]**
  → **[API][S]** `GET /api/male/coin-plans`
  → **[SERVICE][S]** `coinPlanService.getActivePlans`

**Start Payment**
- **FE** select plan & pay button **[S]**
  → **[API][S]** `POST /api/male/payment/create-order`
  → **[SERVICE][S]** `paymentService.createRazorpayOrder`
  → **[DB][S]** create pending Transaction
  → returns `orderId`, amount, key to FE

**Payment Completion**
- Razorpay callback / client confirmation **[S]**
  → **[API][S]** `POST /api/male/payment/verify`
  → **[SERVICE][S]** `paymentService.verifySignatureAndComplete`
  → **[DB][S]**:
    - Mark Transaction as success
    - Increase `User.coinBalance`

### 2.4 Checklist

- [ ] Razorpay test integration (keys in `.env`) **[S]**
- [ ] Order creation + verification logic **[S]**
- [ ] Idempotency on payment callbacks **[S]**
- [ ] FE wiring of Razorpay checkout **[S]**
- [ ] **BMAD Models** **[S]**
  - `CoinPlan`, `PaymentOrder`, `PaymentVerificationPayload`
- [ ] **BMAD Actions** **[S]**
  - `createPurchaseOrder(userId, planId) → PaymentOrder`
  - `verifyAndSettlePayment(payload) → SettlementResult`
  - Pre-conditions: plan is active, user is male, not blocked
- [ ] **Safety & subfeatures** **[S]**
  - Strong idempotency key (e.g. Razorpay paymentId) to avoid double credits
  - Graceful handling of payment failure: create failed Transaction with reason
  - Webhook vs client-confirmation reconciliation (future-ready)

---

## 3. Chat, Gifts & Video Calls (Male & Female) – **Harsh Primary**

> Central domain that touches coins & earnings. Must be cleanly integrated with wallet/earnings services built by Sujal.

### 3.1 Data Models (Chat Domain)

- [ ] **[DB][H]** `Chat`:
  - participants (maleId, femaleId)
  - lastMessage, lastMessageAt
  - unread counts
- [ ] **[DB][H]** `Message`:
  - chatId, senderId, receiverId
  - type: text | image | gift | system
  - content, mediaUrl, giftId
  - coinCost (for male sent messages)
  - status: sent | delivered | read
  - timestamps
- [ ] **[DB][H]** optional `Gift` catalog if needed

- [ ] **BMAD Models (Chat Domain)** **[H]**
  - `ChatThread`, `ChatParticipant`, `ChatMessage`, `GiftMessage`, `CallSession`
  - Validation contracts (e.g. max message length, allowed media types)
- [ ] **BMAD Actions (Chat Domain)** **[H]**
  - `createOrGetChat(maleId, femaleId) → ChatThread`
  - `appendMessage(chatId, messageModel) → ChatMessage`
  - `markMessagesRead(chatId, readerId) → void`
  - `listMessages(chatId, pagination) → Paginated<ChatMessage>`
- [ ] **Subfeatures for smooth operation** **[H]**
  - Soft delete of messages/chats (per user) vs hard delete
  - Anti-spam / rate limit on sending messages per minute
  - Handling blocked users (chat attempts rejected with clear error)
  - Consistent ordering, gap handling when messages arrive out-of-order

---

### 3.2 Real‑Time Messaging Flow

**Send Message (Male → Female, costs 50 coins)**
- **FE** `MessageInput` (Male) send **[H]**
  → **[SOCKET][H]** `socket.emit('chat:sendMessage', payload)`
  → **[SOCKET HANDLER][H]** `chatSocketHandlers.handleSendMessage`
  → **[SERVICE][H]** `chatService.sendMessage(maleId, femaleId, content)`
  → **[SERVICE][S]** `walletService.deductForMessage(maleId, 50)`  ← **called by Harsh**
  → **[SERVICE][S]** `earningsService.creditForMessage(femaleId, 50)` ← **called by Harsh**
  → **[DB][H]** save `Message`, update `Chat` lastMessage
  → **[SOCKET][H]** emit to receiver `chat:messageReceived`
  → **[API or SOCKET][H]** send updated balance to Male (via Sujal’s wallet service)

**Send Message (Female → Male, FREE)**
- **FE** `MessageInput` (Female) send **[H]**
  → **[SOCKET][H]** `chat:sendMessage`
  → **[SERVICE][H]** `chatService.sendFreeMessage(femaleId, maleId, content)`
  → **[DB][H]** save `Message`, update `Chat`
  → **[SOCKET][H]** emit to Male

### 3.2 Checklist

- [ ] Socket auth & connection tracking **[H]**
- [ ] Events: `chat:sendMessage`, `chat:messageReceived`, `chat:seen`, `chat:typing` **[H]**
- [ ] Message cost constants aligned with business rules **[H & S sanity‑check]**
- [ ] Integration with wallet/earnings services **[H calls S’s services]**
- [ ] FE chat list auto‑update via sockets **[H]**
- [ ] **BMAD Models** **[H+S]**
  - `PaidMessageActionModel` (senderId, receiverId, content, cost = 50)
  - `FreeMessageActionModel` (no cost)
- [ ] **BMAD Actions** **[H+S]**
  - `sendPaidMessage(model) → { message, newBalances }`
    - Internally composes:
      - `walletActions.deductCoins(maleId, 50)` **[S]**
      - `earningActions.creditCoins(femaleId, 50)` **[S]**
      - `chatActions.appendMessage(...)` **[H]**
  - `sendFreeMessage(model) → message`
- [ ] **Safety & error flows** **[H+S]**
  - If wallet deduction fails (insufficient coins), message must **not** be sent
  - If earnings credit fails after deduction, must either:
    - Roll back deduction, **or**
    - Record a compensating transaction (saga pattern)
  - Distinguish between transient errors (retry possible) vs hard errors (validation)
  - Clear error codes for FE: `INSUFFICIENT_COINS`, `BLOCKED_USER`, `RATE_LIMITED`

---

### 3.3 Gifts Flow

**Gift Send (Male → Female)**
- **FE** `ChatGiftSelectorModal` **[H]**
  → **[SOCKET or API][H]** `chat:sendGift`
  → **[SERVICE][H]** `chatService.sendGift(maleId, femaleId, giftId)`
  → **[SERVICE][S]** `walletService.deductForGift(maleId, giftCost)` (configurable) **[S]**
  → **[SERVICE][S]** `earningsService.creditForGift(femaleId, giftCost)` **[S]**
  → **[DB][H]** create `Message` of type `gift`
  → **[SOCKET][H]** notify receiver

### 3.3 Checklist

- [ ] Gift catalog config (static or DB) **[H or S – agree once]**
- [ ] Backend gift send logic & cost application **[H + S integration]**
- [ ] FE visuals for gift messages **[H]**

- [ ] **BMAD Models** **[H+S]**
  - `GiftDefinition` (id, name, icon, cost, rarity)
  - `GiftSendModel` (giftId, senderId, receiverId)
- [ ] **BMAD Actions** **[H+S]**
  - `sendGift(model) → { message, newBalances }`
- [ ] **Subfeatures** **[H+S]**
  - Validation that giftId exists and is active
  - Dynamic cost from config (admin-manageable)
  - Transaction tagging for gifts to separate analytics

---

### 3.4 Video Call Flow (Signaling Only)

**Start Call (Male → Female, costs 500 coins)**
- **FE** `ChatWindowHeader` video button **[H]**
  → **[SOCKET][H]** `call:initiate`
  → **[SERVICE][H]** `callService.startCall(maleId, femaleId)`
  → **[SERVICE][S]** `walletService.deductForCall(maleId, 500)` **[S]**
  → **[SERVICE][S]** `earningsService.creditForCall(femaleId, 500)` **[S]**
  → **[SOCKET][H]** `call:ringing` to Female
  → WebRTC (or placeholder) flow for actual media (future)

### 3.4 Checklist

- [ ] Call signaling events: `call:initiate`, `call:accept`, `call:reject`, `call:end` **[H]**
- [ ] Coin deduction/credit integration **[H uses S services]**
- [ ] Minimal FE UI for call states **[H]**

- [ ] **BMAD Models** **[H+S]**
  - `CallStartModel` (callerId, calleeId, cost = 500)
  - `CallSession` (id, status, startedAt, endedAt, duration)
- [ ] **BMAD Actions** **[H+S]**
  - `startPaidCall(model) → { callSession, newBalances }`
  - `endCall(callSessionId, reason) → CallSession`
- [ ] **Subfeatures & safety** **[H+S]**
  - Prevent concurrent active calls per user
  - Proper handling when call is rejected/busy (no coin deduction or partial logic)
  - Optional: prorated earnings based on duration (future enhancement)

---

## 4. Female Module – Earnings, Withdrawals, Free Chat

### 4.1 Female Dashboard

**Flow**
- **FE** `FemaleDashboard.tsx` **[S]**
  → **[API][S]** `GET /api/female/dashboard`
  → **[SERVICE][S]** `femaleDashboardService.buildDashboardData`
  → **[DB][S]**:
    - Earnings summary (total, available, pending)
    - Stats (messages received, active conversations, profile views)
  → **[SERVICE][H]** (optional) for active chat previews

### 4.1 Checklist

- [ ] Earnings aggregation by type (messages, calls, gifts) **[S]**
- [ ] Reuse chat service for active chat stats **[H]**
- [ ] Replace mock dashboard data with API **[S]**

- [ ] **BMAD Models** **[S]**
  - `FemaleDashboardData`, `EarningsSummary`, `ConversationStat`
- [ ] **BMAD Actions** **[S]**
  - `buildFemaleDashboard(userId) → FemaleDashboardData`
- [ ] **Subfeatures** **[S]**
  - Show trends (this week vs last week)
  - Handle large earnings history efficiently (aggregated metrics)

---

### 4.2 Earnings Page

**Flow**
- **FE** `EarningsPage.tsx` **[S]**
  → **[API][S]** `GET /api/female/earnings?period=daily|weekly|monthly&range=...`
  → **[SERVICE][S]** `earningsService.getEarningsTimeline`
  → **[DB][S]** query earnings data from Transactions or dedicated earnings table

### 4.2 Checklist

- [ ] Earnings breakdown by type & period **[S]**
- [ ] Chart data transformer **[S]**
- [ ] Export report endpoint `GET /api/female/earnings/export` **[S]**
- [ ] FE chart & export wiring **[S]**

- [ ] **BMAD Models** **[S]**
  - `EarningsFilter`, `EarningsPoint`, `EarningsReport`
- [ ] **BMAD Actions** **[S]**
  - `getEarningsTimeline(userId, filter) → EarningsPoint[]`
  - `exportEarningsReport(userId, filter) → FileDownload`
- [ ] **Subfeatures & safety** **[S]**
  - Timezone-consistent date buckets
  - Export throttling to avoid heavy repeated exports
  - Filters validation (no absurd date ranges)

---

### 4.3 Withdrawal Flow

**Flow**
- **FE** `WithdrawalPage.tsx` **[S]**
  → **[API][S]** `GET /api/female/withdrawals/summary`
  → **[API][S]** `POST /api/female/withdrawals` (create request)
  → **[SERVICE][S]**:
    - Validate min/max, balance
    - Persist Withdrawal
    - Lock coins or move to pending bucket

Admin side:
- **[API][S]** `GET /api/admin/withdrawals`
  → list & filter withdrawals
- **[API][S]** `POST /api/admin/withdrawals/:id/approve|reject|mark-paid`
  → **[SERVICE][S]** update status + coins as per rules

### 4.3 Checklist

- [ ] Withdrawal request validation & persistence **[S]**
- [ ] Coin lock mechanism to avoid double use **[S]**
- [ ] Admin approval flow & audit logs **[S]**
- [ ] FE success/error & status history display **[S]**

- [ ] **BMAD Models** **[S]**
  - `WithdrawalRequestModel`, `WithdrawalMethod` (UPI/Bank), `WithdrawalStatus`
- [ ] **BMAD Actions** **[S]**
  - `requestWithdrawal(userId, model) → Withdrawal`
  - `approveWithdrawal(adminId, withdrawalId) → Withdrawal`
  - `rejectWithdrawal(adminId, withdrawalId, reason) → Withdrawal`
- [ ] **Subfeatures & safety** **[S]**
  - Ensure atomic decrease of available balance and move to pending
  - Prevent multiple concurrent pending withdrawals over allowed limit
  - Detailed status timeline for user (requested → under review → approved → paid)

---

### 4.4 Auto‑Message Templates

**Flow**
- **FE** `AutoMessageTemplatesPage.tsx` **[S]**
  → **[API][S]** `GET /api/female/auto-messages`
  → **[API][S]** `POST /api/female/auto-messages`
  → **[API][S]** `PUT /api/female/auto-messages/:id`
  → **[API][S]** `DELETE /api/female/auto-messages/:id`
  → **[SERVICE][S]** CRUD on templates

Runtime usage:
- **[SERVICE][H]** in chat flow may optionally query auto‑messages for suggestions; OR
- **[S]** may schedule them outside real‑time chat.

### 4.4 Checklist

- [ ] Template CRUD endpoints & validation **[S]**
- [ ] FE modals & forms wired to API **[S]**
- [ ] Decision: how auto messages trigger (on new chat, on delay, etc.) **[S + H design]**

- [ ] **BMAD Models** **[S]**
  - `AutoMessageTemplate` (id, name, content, triggers[], enabled)
  - `TriggerCondition` (type: time_based | keyword_based | manual, config)
- [ ] **BMAD Actions** **[S]**
  - `createTemplate(userId, model) → AutoMessageTemplate`
  - `updateTemplate(userId, id, model) → AutoMessageTemplate`
  - `evaluateTriggers(context) → AutoMessageTemplate[]`
- [ ] **Potential workflows** **[H+S]**
  - On new incoming chat, evaluate templates and suggest replies (no auto-send initially)
  - Scheduled auto-messages after inactivity (cron / background worker in future)

---

## 5. Notifications System

### 5.1 Notification Types

- Message received (chat) **[H produces, FE both]**
- Video call incoming **[H produces, FE both]**
- Earnings update **[S produces, FE female]**
- Withdrawal status **[S produces, FE female]**
- Purchase success/failure **[S produces, FE male]**
- System/admin notifications **[S produces, FE all]**

### 5.2 Flows

**Create Notification (server)**
- Domain event occurs (message, withdrawal, payment, etc.)
  → **[SERVICE][S/H]** `notificationService.createNotification(userId, payload)`
  → **[DB][S]** insert Notification
  → **[SOCKET][H or S]** emit `notification:new` if online

**Fetch Notifications (client)**
- **FE** Notifications pages **[S]**
  → **[API][S]** `GET /api/notifications?type=&read=`
  → **[SERVICE][S]** filter from DB

### 5.2 Checklist

- [ ] Notification model & service **[S]**
- [ ] Hooks for chat, earnings, withdrawal, payments to create notifications **[S+H]**
- [ ] FE unread badge + mark‑as‑read logic **[S]**

- [ ] **BMAD Models** **[S]**
  - `Notification` (id, userId, type, title, message, read, actionUrl, createdAt)
  - `NotificationFilter`
- [ ] **BMAD Actions** **[S]**
  - `createNotification(model) → Notification`
  - `listNotifications(userId, filter) → Paginated<Notification>`
  - `markNotificationRead(userId, id) → void`
- [ ] **Subfeatures & safety** **[S]**
  - De-duplication for identical system notifications
  - Soft-deletion vs permanent deletion
  - Backoff when user has huge number of notifications (pagination + archive)

---

## 6. Admin Module – Management & Monitoring

Use existing `ADMIN_EXECUTION_PLAN.md` as spec; here are logic checklists.

### 6.1 Admin Dashboard

- [ ] **[API][S]** `GET /api/admin/dashboard`
- [ ] **[SERVICE][S]** aggregates:
  - Users stats
  - Revenue (sum of purchases)
  - Payouts (sum of withdrawals)
  - Profit = deposits - payouts
  - Pending withdrawals
  - Transactions count
  - Recent activity (from AuditLog)

### 6.2 User Management

- [ ] **[API][S]** `GET /api/admin/users` (with filters & pagination)
- [ ] **[API][S]** `GET /api/admin/users/:id`
- [ ] **[API][S]** `POST /api/admin/users/:id/block`
- [ ] **[API][S]** `POST /api/admin/users/:id/verify`
- [ ] **[SERVICE][S]** user filtering & status updates

### 6.3 Female Approval

- [ ] **[API][S]** `GET /api/admin/females/pending`
- [ ] **[API][S]** `POST /api/admin/females/:id/approve|reject`
- [ ] **[SERVICE][S]** approval state updates + notifications

### 6.4 Coin Economy

- [ ] CRUD for `CoinPlan` & `PayoutSlab` **[API/SERVICE][S]**
- [ ] Message/video cost config endpoints **[S]**
- [ ] Apply configured costs in wallet/earnings services used by chat **[S + H]**

### 6.5 Withdrawals, Transactions, Audit Logs

- [ ] Withdrawal listing & actions endpoints **[S]**
- [ ] Transactions listing with filters **[S]**
- [ ] Audit log recording for all sensitive admin actions **[S]**
- [ ] FE pages wired to APIs **[S]**

- [ ] **BMAD Models** **[S]**
  - `AdminDashboardStats`, `AdminTransaction`, `AuditLogEntry`
- [ ] **BMAD Actions** **[S]**
  - `buildAdminDashboard() → AdminDashboardStats`
  - `logAdminAction(model) → AuditLogEntry`
- [ ] **Subfeatures & safety** **[S]**
  - Always log before/after state for critical changes (e.g. withdrawal status)
  - Efficient filters & indexes on high-volume collections (transactions, logs)

---

## 7. Profiles & Discovery (Male & Female)

- [ ] Profile CRUD endpoints `GET/PUT /api/profile` **[S]**
- [ ] Photo upload (S3/Cloudinary or similar) **[S]**
- [ ] Discovery search & filters for males (already in §2.2) **[S]**
- [ ] Female view of male profile (earnings view not needed) **[S]**

---

## 8. Testing & Hardening

- [ ] Unit tests for services (auth, wallet, earnings, chat) **[S for non‑chat, H for chat]**
- [ ] Integration tests for key workflows:
  - [ ] Message send → coins deducted/credited **[H + S]**
  - [ ] Gift send → coins deducted/credited **[H + S]**
  - [ ] Call start → coins deducted/credited **[H + S]**
  - [ ] Purchase coins → wallet updated **[S]**
  - [ ] Withdrawal approve → coins moved from pending **[S]**
- [ ] Load considerations for hot endpoints (chat, wallet, earnings) **[S + H]**

- [ ] **BMAD Validation Phase** **[S+H]**
  - Validate all models (type + runtime validation) before actions
  - Ensure each action documents:
    - Pre-conditions
    - Post-conditions
    - Error states
    - Side effects (DB write, socket emit, external call)

---

## 9. Practical Work Split Summary

### Harsh – Focus Checklist

- [ ] Socket.IO server & chat events
- [ ] Chat/Message models & services
- [ ] FE chat pages & components (male + female)
- [ ] Gifts flow (FE + API + socket) integrating with Sujal’s wallet/earnings
- [ ] Video call signaling & coin integration
- [ ] Chat‑related notifications

### Sujal – Focus Checklist

- [ ] Auth & profile flows
- [ ] Wallet, payments, earnings core logic
- [ ] Withdrawals & admin approval flows
- [ ] Discovery & dashboards (male/female/admin)
- [ ] Notifications (server‑side, non‑chat)
- [ ] Admin panel full logic

---

> As you implement, you can tick items in this checklist and extend it when new sub‑features emerge.  
> For any **new workflow**, document it in this file using the `→` arrow notation and clearly tag responsible dev with **[H]** or **[S]**.


