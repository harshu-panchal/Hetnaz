---
name: Dating App Architecture Plan
overview: Complete production-ready architecture plan for a global earning-based dating web application with male/female/admin roles, coin economy, real-time chat, Razorpay payments, and location-based matching.
todos:
  - id: setup-project
    content: "Initialize project structure: create backend and frontend directories, setup package.json files, install dependencies (Express, React, TypeScript, Mongoose, Socket.IO, Zustand, etc.)"
    status: completed
  - id: backend-models
    content: "Create all Mongoose models: User, Profile, Wallet, WalletTransaction, Message, CoinPlan, PayoutSlab, Payment, WithdrawalRequest, AuditLog, DeviceLog, RefreshToken, AutoMessageTemplate, AdminSettings"
    status: completed
    dependencies:
      - setup-project
  - id: backend-auth
    content: "Implement authentication system: register/login endpoints, JWT token generation (access + refresh), password hashing, role-based middleware, device/IP logging"
    status: completed
    dependencies:
      - backend-models
  - id: backend-wallet
    content: "Build wallet service with atomic operations: creditCoins, debitCoins, transferCoins using MongoDB sessions, WalletTransaction logging, balance validation"
    status: completed
    dependencies:
      - backend-models
  - id: backend-razorpay
    content: "Integrate Razorpay: create order endpoint, payment verification, webhook handler, coin crediting on success, Payment model updates"
    status: completed
    dependencies:
      - backend-wallet
  - id: backend-chat
    content: "Implement chat system: Message model, chat routes (list, history), Socket.IO server setup with authentication, message sending with payment flow, read receipts"
    status: completed
    dependencies:
      - backend-wallet
      - backend-auth
  - id: backend-location
    content: "Build location service: GeoJSON Point storage, 2dsphere index, nearbyFemalesForMale query with distance/age/interest filters, online status check"
    status: completed
    dependencies:
      - backend-models
  - id: backend-auto-message
    content: "Implement auto-message system: AutoMessageTemplate model, female template CRUD, auto-send logic on male login/dashboard load, rate limiting"
    status: completed
    dependencies:
      - backend-chat
      - backend-location
  - id: backend-withdrawal
    content: "Build withdrawal system: WithdrawalRequest model, female withdrawal endpoint, payout slab calculation, admin approval/rejection endpoints, coin deduction on approval"
    status: completed
    dependencies:
      - backend-wallet
  - id: backend-admin
    content: "Create admin panel APIs: dashboard stats, user management, female approval, coin plan CRUD, payout slab CRUD, withdrawal management, transaction history, audit logging"
    status: in_progress
    dependencies:
      - backend-models
      - backend-wallet
  - id: backend-security
    content: "Implement security features: rate limiting middleware (Redis-based), input validation, error handling, audit logging for admin actions, abuse reporting"
    status: pending
    dependencies:
      - backend-auth
  - id: frontend-setup
    content: "Setup frontend: Vite + React + TypeScript, Tailwind CSS, React Router, Zustand stores, Axios instance with interceptors, Socket.IO client setup"
    status: pending
    dependencies:
      - setup-project
  - id: frontend-auth
    content: "Build auth pages: LoginPage, RegisterPage with role selection, OTP verification (optional), protected route guards, token refresh logic"
    status: pending
    dependencies:
      - frontend-setup
  - id: frontend-male
    content: "Create male dashboard: MaleDashboard with wallet balance, NearbyFemalesPage with location-based discovery, ChatListPage, ChatWindowPage with Socket.IO, WalletPage, CoinPurchasePage with Razorpay"
    status: pending
    dependencies:
      - frontend-auth
      - frontend-setup
  - id: frontend-female
    content: "Build female dashboard: FemaleDashboard, ChatListPage, ChatWindowPage (free messaging), EarningsPage, WithdrawalPage, AutoMessageTemplatesPage"
    status: pending
    dependencies:
      - frontend-auth
      - frontend-setup
  - id: frontend-admin
    content: "Create admin panel: AdminDashboard with profit analytics, UsersManagementPage, FemaleApprovalPage, CoinEconomyPage, WithdrawalManagementPage, TransactionsPage, SettingsPage, AuditLogsPage"
    status: pending
    dependencies:
      - frontend-auth
      - frontend-setup
  - id: frontend-components
    content: "Build reusable components: common UI (Button, Input, Modal, Card, Avatar), chat components (ChatList, ChatWindow, MessageBubble), profile components (ProfileCard, ProfileForm, PhotoUpload), wallet components (WalletBalance, TransactionList, CoinPlanCard)"
    status: pending
    dependencies:
      - frontend-setup
  - id: frontend-mobile
    content: "Optimize for mobile: responsive layouts, touch-friendly UI, mobile-first Tailwind classes, proper viewport settings, mobile navigation"
    status: pending
    dependencies:
      - frontend-male
      - frontend-female
      - frontend-admin
  - id: docker-setup
    content: "Create Docker configuration: docker-compose.yml with MongoDB, Redis, backend, frontend services, Dockerfiles for backend and frontend, environment variable setup"
    status: pending
    dependencies:
      - backend-security
      - frontend-mobile
  - id: documentation
    content: "Write documentation: README.md with setup instructions, API documentation, environment variable examples, deployment guide, architecture overview"
    status: pending
    dependencies:
      - docker-setup
---

# MatchMint Dating Application - Complete Architecture & Execution Plan

## Project Overview

A monolithic but modular full-stack dating application with a coin-based economy where males pay to message females, and females earn coins that can be redeemed for money. Built with React + TypeScript frontend and Node.js + Express + MongoDB backend.

## Technology Stack

### Frontend

- **Framework**: Vite + React 18 + TypeScript (TSX)
- **Styling**: Tailwind CSS (custom components, mobile-first design)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.IO client
- **Routing**: React Router v6 with protected routes
- **UI Components**: Custom components built with Tailwind

### Backend

- **Runtime**: Node.js 18+ with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO server
- **Caching**: Redis (for rate limiting, session management, socket scaling)
- **Authentication**: JWT (access + refresh tokens)
- **Payments**: Razorpay integration
- **Validation**: express-validator or Joi

## Project Structure

```
matchmint-dating-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # Mongoose connection
│   │   │   ├── redis.ts             # Redis client setup
│   │   │   ├── razorpay.ts          # Razorpay client
│   │   │   └── env.ts               # Environment validation
│   │   ├── models/
│   │   │   ├── User.ts              # User model (role: male/female/admin)
│   │   │   ├── Profile.ts           # User profiles with location
│   │   │   ├── Wallet.ts            # Wallet balances
│   │   │   ├── WalletTransaction.ts # All coin transactions
│   │   │   ├── Message.ts           # Chat messages
│   │   │   ├── AutoMessageTemplate.ts # Female auto-message templates
│   │   │   ├── WithdrawalRequest.ts # Female withdrawal requests
│   │   │   ├── CoinPlan.ts          # Admin-defined coin purchase plans
│   │   │   ├── PayoutSlab.ts        # Admin-defined payout tiers
│   │   │   ├── Payment.ts           # Razorpay payment records
│   │   │   ├── AdminSettings.ts     # Global app settings
│   │   │   ├── AuditLog.ts          # Admin action logs
│   │   │   ├── DeviceLog.ts         # Device/IP tracking
│   │   │   └── RefreshToken.ts      # Refresh token storage
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # Register, login, refresh, logout
│   │   │   ├── profile.routes.ts    # Profile CRUD
│   │   │   ├── wallet.routes.ts     # Wallet balance, transactions
│   │   │   ├── chat.routes.ts       # Chat list, message history
│   │   │   ├── payment.routes.ts    # Razorpay order creation, verification, webhook
│   │   │   ├── female.routes.ts    # Auto-messages, withdrawal requests
│   │   │   ├── male.routes.ts       # Nearby females, discovery
│   │   │   └── admin.routes.ts      # All admin panel APIs
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── wallet.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── female.controller.ts
│   │   │   ├── male.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts      # JWT generation, password hashing
│   │   │   ├── wallet.service.ts    # creditCoins, debitCoins, transferCoins (with transactions)
│   │   │   ├── chat.service.ts      # Message creation, chat list
│   │   │   ├── location.service.ts  # Nearby females query (geoNear)
│   │   │   ├── payment.service.ts   # Razorpay integration
│   │   │   ├── autoMessage.service.ts # Auto-message sending logic
│   │   │   └── admin.service.ts     # Admin operations with audit logging
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   ├── role.middleware.ts   # Role-based access (male/female/admin)
│   │   │   ├── rateLimit.middleware.ts # Rate limiting (Redis-based)
│   │   │   ├── errorHandler.middleware.ts # Global error handler
│   │   │   └── validator.middleware.ts # Request validation
│   │   ├── sockets/
│   │   │   ├── socketServer.ts      # Socket.IO server setup
│   │   │   ├── socketAuth.ts        # Socket authentication middleware
│   │   │   └── chatHandlers.ts      # Message sending, read receipts
│   │   ├── utils/
│   │   │   ├── logger.ts            # Winston or Pino logger
│   │   │   ├── constants.ts         # App constants
│   │   │   └── helpers.ts           # Utility functions
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces/types
│   │   └── app.ts                   # Express app setup
│   ├── server.ts                    # Server entry point
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── OTPVerificationPage.tsx (optional)
│   │   │   ├── male/
│   │   │   │   ├── MaleDashboard.tsx
│   │   │   │   ├── NearbyFemalesPage.tsx
│   │   │   │   ├── ChatListPage.tsx
│   │   │   │   ├── ChatWindowPage.tsx
│   │   │   │   ├── WalletPage.tsx
│   │   │   │   └── CoinPurchasePage.tsx
│   │   │   ├── female/
│   │   │   │   ├── FemaleDashboard.tsx
│   │   │   │   ├── ChatListPage.tsx
│   │   │   │   ├── ChatWindowPage.tsx
│   │   │   │   ├── EarningsPage.tsx
│   │   │   │   ├── WithdrawalPage.tsx
│   │   │   │   └── AutoMessageTemplatesPage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── UsersManagementPage.tsx
│   │   │       ├── FemaleApprovalPage.tsx
│   │   │       ├── CoinEconomyPage.tsx
│   │   │       ├── WithdrawalManagementPage.tsx
│   │   │       ├── TransactionsPage.tsx
│   │   │       ├── SettingsPage.tsx
│   │   │       └── AuditLogsPage.tsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatList.tsx
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   └── MessageInput.tsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   ├── ProfileForm.tsx
│   │   │   │   └── PhotoUpload.tsx
│   │   │   └── wallet/
│   │   │       ├── WalletBalance.tsx
│   │   │       ├── TransactionList.tsx
│   │   │       └── CoinPlanCard.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts         # Auth state (user, tokens)
│   │   │   ├── chatStore.ts         # Chat state, socket connection
│   │   │   ├── walletStore.ts       # Wallet balance, transactions
│   │   │   └── profileStore.ts      # User profile state
│   │   ├── services/
│   │   │   ├── api.ts               # Axios instance with interceptors
│   │   │   ├── authService.ts       # Auth API calls
│   │   │   ├── profileService.ts
│   │   │   ├── chatService.ts
│   │   │   ├── walletService.ts
│   │   │   ├── paymentService.ts
│   │   │   └── adminService.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSocket.ts         # Socket.IO connection hook
│   │   │   ├── useChat.ts
│   │   │   └── useGeolocation.ts   # Get user location
│   │   ├── layouts/
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── MaleLayout.tsx      # Navbar with wallet, chat, profile
│   │   │   ├── FemaleLayout.tsx
│   │   │   └── AdminLayout.tsx
│   │   ├── routes/
│   │   │   └── AppRoutes.tsx        # Route definitions with role guards
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── formatters.ts       # Date, currency formatters
│   │   │   └── validators.ts       # Zod schemas
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript types/interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── index.html
│
├── docker-compose.yml               # MongoDB, Redis, Backend, Frontend
├── README.md                        # Setup instructions
└── .gitignore
```

## Core Implementation Details

### 1. Authentication & Authorization

**Backend (`backend/src/routes/auth.routes.ts`)**:

- `POST /api/auth/register` - Role-based registration (male/female)
- `POST /api/auth/login` - JWT token generation
- `POST /api/auth/refresh` - Refresh token rotation
- `POST /api/auth/logout` - Token invalidation
- `POST /api/auth/otp/send` - OTP generation (email/SMS)
- `POST /api/auth/otp/verify` - OTP verification

**Security Features**:

- Password hashing with bcrypt (10 rounds)
- JWT access tokens (15min expiry) + refresh tokens (7 days)
- Device fingerprinting and IP logging on login
- Rate limiting: 5 login attempts per 15min per IP
- Role-based route protection middleware

### 2. User & Profile System

**User Model** (`backend/src/models/User.ts`):

```typescript
{
  email: string (unique, indexed)
  password: string (hashed)
  role: "male" | "female" | "admin"
  isBlocked: boolean
  isEmailVerified: boolean
  lastLoginAt: Date
  lastLoginIP: string
  createdAt: Date
}
```

**Profile Model** (`backend/src/models/Profile.ts`):

```typescript
{
  userId: ObjectId (ref: User, unique, indexed)
  name: string
  age: number (min: 18)
  gender: string
  bio: string (max: 500)
  city: string
  location: { type: "Point", coordinates: [longitude, latitude] } (2dsphere index)
  interests: string[]
  photos: string[] (S3/Cloudinary URLs)
  // Female-specific
  approvalStatus: "pending" | "approved" | "rejected"
  verifiedAt: Date
  reviewedByAdminId: ObjectId
  reviewNotes: string
  // Male-specific
  preferences: {
    ageRange: { min: number, max: number }
    maxDistance: number (km)
    interests: string[]
  }
}
```

**Key Rules**:

- Female cannot access chat/earn until `approvalStatus === "approved"`
- Male cannot access dashboard until profile is complete
- Location stored as GeoJSON Point for efficient queries

### 3. Wallet & Coin Economy

**Wallet Model** (`backend/src/models/Wallet.ts`):

```typescript
{
  userId: ObjectId (ref: User, unique, indexed)
  balanceCoins: number (default: 0)
  tier: "basic" | "silver" | "gold" | "platinum" (default: "basic")
  lastUpdatedAt: Date
}
```

**WalletTransaction Model** (`backend/src/models/WalletTransaction.ts`):

```typescript
{
  userId: ObjectId (ref: User, indexed)
  type: "purchase" | "message_spent" | "message_earned" | "withdrawal" | "adjustment"
  amountCoins: number
  amountINR: number (optional)
  direction: "credit" | "debit"
  relatedUserId: ObjectId (for transfers)
  relatedMessageId: ObjectId (for chat)
  relatedPaymentId: ObjectId (for Razorpay)
  relatedWithdrawalId: ObjectId
  balanceAfter: number
  createdAt: Date (indexed)
}
```

**Wallet Service** (`backend/src/services/wallet.service.ts`):

- `creditCoins(userId, amount, context)` - Atomic credit with transaction log
- `debitCoins(userId, amount, context)` - Atomic debit with balance check
- `transferCoins(fromUserId, toUserId, amount, context)` - Atomic transfer using MongoDB sessions
- All operations use MongoDB transactions for consistency

**Coin Plans** (`backend/src/models/CoinPlan.ts`):

```typescript
{
  name: string (e.g., "Basic", "Silver", "Gold", "Platinum")
  priceInINR: number
  baseCoins: number
  bonusCoins: number
  totalCoins: number (calculated)
  tier: "basic" | "silver" | "gold" | "platinum"
  isActive: boolean
  displayOrder: number
}
```

**Message Cost Configuration** (stored in `AdminSettings`):

```typescript
{
  messageCostByTier: {
    basic: number (e.g., 20)
    silver: number (e.g., 18)
    gold: number (e.g., 16)
    platinum: number (e.g., 12)
  }
}
```

**Payout Slabs** (`backend/src/models/PayoutSlab.ts`):

```typescript
{
  minCoins: number
  maxCoins: number (null for unlimited)
  payoutPercentage: number (e.g., 40, 50, 60, 70)
  displayOrder: number
}
```

### 4. Real-Time Chat System

**Message Model** (`backend/src/models/Message.ts`):

```typescript
{
  senderId: ObjectId (ref: User, indexed)
  receiverId: ObjectId (ref: User, indexed)
  text: string
  isAutoMessage: boolean (default: false)
  isPaid: boolean (default: false)
  coinsCharged: number
  status: "sent" | "delivered" | "read"
  chatRoomId: string (computed: sorted [senderId, receiverId].join('_'))
  createdAt: Date (indexed)
  readAt: Date
}
```

**Socket.IO Implementation** (`backend/src/sockets/`):

- Authentication via JWT on connection
- Maintain `Map<userId, Set<socketId>>` for multi-device support
- Room creation: `chatRoomId` format
- Events:
  - `message:send` - Male sends message (triggers payment)
  - `message:received` - Delivery confirmation
  - `message:read` - Read receipt
  - `typing:start` / `typing:stop`

**Message Sending Flow** (Male → Female):

1. Validate sender role = "male", receiver role = "female"
2. Check male wallet balance >= messageCostCoins
3. Start MongoDB session
4. Debit coins from male wallet
5. Credit coins to female wallet
6. Create WalletTransaction records (both)
7. Create Message document
8. Commit transaction
9. Emit Socket.IO event to both users
10. Return success response

**Auto-Message System** (`backend/src/services/autoMessage.service.ts`):

- Female creates templates via `POST /api/female/auto-messages`
- On male login/dashboard load:
  - Find nearby active females
  - For each female with active template:
    - Send auto-message (no coin cost, `isAutoMessage: true`)
    - Rate limit: max 1 auto-message per female per male per day

### 5. Razorpay Payment Integration

**Payment Model** (`backend/src/models/Payment.ts`):

```typescript
{
  userId: ObjectId (ref: User, indexed)
  planId: ObjectId (ref: CoinPlan)
  razorpayOrderId: string (unique, indexed)
  razorpayPaymentId: string
  status: "created" | "success" | "failed"
  amount: number (INR)
  coinsCredited: number
  createdAt: Date
  completedAt: Date
}
```

**Payment Routes** (`backend/src/routes/payment.routes.ts`):

- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature
- `POST /api/payments/webhook` - Razorpay webhook handler

**Payment Flow**:

1. Male selects coin plan
2. Frontend calls `/api/payments/create-order`
3. Backend creates Razorpay order, stores Payment record (status: "created")
4. Frontend opens Razorpay checkout
5. On success, frontend calls `/api/payments/verify` with payment details
6. Backend verifies signature, credits coins, updates Payment status
7. Webhook handler reconciles any missed payments

### 6. Female Withdrawal System

**WithdrawalRequest Model** (`backend/src/models/WithdrawalRequest.ts`):

```typescript
{
  userId: ObjectId (ref: User, indexed)
  coinsRequested: number
  payoutMethod: "UPI" | "bank"
  payoutDetails: {
    upiId?: string
    accountNumber?: string
    ifscCode?: string
    accountHolderName?: string
  }
  status: "pending" | "approved" | "rejected" | "paid"
  payoutAmountINR: number (calculated based on slab)
  payoutPercentage: number (from matching slab)
  reviewedByAdminId: ObjectId
  reviewNotes: string
  paidAt: Date
  createdAt: Date (indexed)
}
```

**Withdrawal Flow**:

1. Female submits request via `POST /api/female/withdrawals`
2. System validates: balance >= coinsRequested, within daily/weekly limits
3. Admin reviews via admin panel
4. On approval: deduct coins, calculate INR based on matching PayoutSlab
5. Admin manually marks as "paid" after actual transfer

### 7. Location-Based Discovery

**Location Service** (`backend/src/services/location.service.ts`):

- `nearbyFemalesForMale(maleUserId, options)`:
  - Get male profile and preferences
  - Query females with:
    - `$geoNear` for distance filtering
    - `approvalStatus === "approved"`
    - Age range match
    - Interest overlap (at least one common)
    - Online status (last seen < 5min)
  - Return sorted by distance

**MongoDB Indexes**:

- Profile: `location: "2dsphere"`, `userId: 1`, `approvalStatus: 1`
- User: `role: 1`, `isBlocked: 1`

### 8. Admin Panel APIs

**Admin Routes** (`backend/src/routes/admin.routes.ts`):

- `GET /api/admin/dashboard` - Overview stats (deposits, payouts, profit)
- `GET /api/admin/users` - List users with filters
- `POST /api/admin/users/:id/block` - Block/unblock user
- `GET /api/admin/females/pending` - Pending approval list
- `POST /api/admin/females/:id/approve` - Approve female
- `POST /api/admin/females/:id/reject` - Reject female
- `CRUD /api/admin/coin-plans` - Manage coin plans
- `CRUD /api/admin/payout-slabs` - Manage payout slabs
- `PUT /api/admin/settings/message-costs` - Update tier costs
- `GET /api/admin/withdrawals` - List withdrawal requests
- `POST /api/admin/withdrawals/:id/approve` - Approve withdrawal
- `POST /api/admin/withdrawals/:id/reject` - Reject withdrawal
- `PUT /api/admin/withdrawals/:id/mark-paid` - Mark as paid
- `GET /api/admin/transactions` - Transaction history
- `GET /api/admin/audit-logs` - Audit log history

**Audit Logging** (`backend/src/models/AuditLog.ts`):

- Every admin action logged with: action, adminId, targetUserId, details, timestamp

### 9. Frontend Implementation

**State Management (Zustand)**:

- `authStore`: User data, tokens, login/logout
- `chatStore`: Active chats, socket connection, messages
- `walletStore`: Balance, transactions, tier
- `profileStore`: User profile data

**Protected Routes** (`frontend/src/routes/AppRoutes.tsx`):

- Role-based route guards
- Redirect to appropriate dashboard based on role
- Profile completion check for males

**Chat UI**:

- Real-time message updates via Socket.IO
- Message status indicators (sent/delivered/read)
- Typing indicators
- Auto-scroll to latest message
- Mobile-optimized layout

**Payment UI**:

- Razorpay checkout integration
- Coin plan selection with tier benefits
- Payment success/failure handling
- Transaction history

### 10. Security & Compliance

**Rate Limiting** (Redis-based):

- Auth routes: 5 requests/15min per IP
- Messaging: 30 messages/min per user
- Payment: 3 orders/10min per user
- Withdrawal: 1 request/day per female

**Validation**:

- Age >= 18 at registration
- Strong password (min 8 chars, uppercase, lowercase, number, special char)
- Email format validation
- Location coordinates validation

**Abuse Prevention**:

- Report user endpoint: `POST /api/users/report`
- Blocked users cannot login or connect via socket
- Admin can view reports and take action

## Environment Variables

**Backend (.env)**:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/matchmint-dating
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your-razorpay-key
```

## Docker Setup

**docker-compose.yml**:

- MongoDB service (port 27017)
- Redis service (port 6379)
- Backend service (build from backend/Dockerfile)
- Frontend service (build from frontend/Dockerfile, serve via nginx)

## Future Extension Points

The architecture is designed to easily add:

- **Video Calls**: Add `VideoCall` model, integrate WebRTC, charge per-minute coins
- **Live Streaming**: Add `StreamRoom` model, integrate streaming service
- **Subscriptions**: Add `Subscription` model, recurring payment logic
- **Referrals**: Add `Referral` model, bonus coin logic
- **Advertising**: Add `Ad` model, impression tracking
- **i18n**: Add translation files, language switcher
- **Sub-admin Roles**: Extend User model with permissions array

## Implementation Phases

### Phase 1: Foundation (Week 1)

1. Project setup (backend + frontend)
2. Database models (User, Profile, Wallet)
3. Auth system (register, login, JWT)
4. Basic profile CRUD

### Phase 2: Core Features (Week 2)

1. Wallet service with transactions
2. Coin plans and purchase flow
3. Razorpay integration
4. Basic chat (without Socket.IO)

### Phase 3: Real-time & Matching (Week 3)

1. Socket.IO integration
2. Paid messaging flow
3. Location-based discovery
4. Auto-message system

### Phase 4: Female Features (Week 4)

1. Female approval workflow
2. Withdrawal system
3. Payout slab calculation
4. Earnings dashboard

### Phase 5: Admin Panel (Week 5)

1. Admin authentication
2. User management
3. Female approval UI
4. Coin economy management
5. Withdrawal management
6. Analytics dashboard

### Phase 6: Polish & Security (Week 6)

1. Rate limiting
2. Audit logging
3. Error handling
4. Mobile responsiveness
5. Testing & bug fixes

## Key Files to Implement

### Critical Backend Files

- `backend/src/models/User.ts` - User schema with roles
- `backend/src/services/wallet.service.ts` - Atomic coin operations
- `backend/src/sockets/chatHandlers.ts` - Real-time message handling
- `backend/src/services/payment.service.ts` - Razorpay integration
- `backend/src/services/location.service.ts` - Geo queries

### Critical Frontend Files

- `frontend/src/store/authStore.ts` - Auth state management
- `frontend/src/hooks/useSocket.ts` - Socket connection
- `frontend/src/pages/male/ChatWindowPage.tsx` - Chat UI
- `frontend/src/pages/admin/CoinEconomyPage.tsx` - Admin coin management
- `frontend/src/services/paymentService.ts` - Razorpay checkout

## Production Checklist

- [ ] Environment variables properly configured
- [ ] MongoDB indexes optimized
- [ ] Redis caching implemented
- [ ] Rate limiting active
- [ ] Error logging (Winston/Pino)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (MongoDB parameterized queries)
- [ ] XSS prevention (sanitize user inputs)
- [ ] CSRF protection
- [ ] File upload security (image validation, size limits)
- [ ] Admin audit logs enabled
- [ ] Backup strategy for MongoDB
- [ ] Monitoring and alerting setup
- [ ] Load testing completed
- [ ] Security audit performed