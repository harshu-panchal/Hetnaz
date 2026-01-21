# Frontend Structure Overview

## Complete Folder Structure

```
frontend/
├── public/
│   └── assets/
│       ├── images/          # Static images
│       └── icons/           # Icon files
│
├── src/
│   ├── features/            # Feature modules (self-contained)
│   │   ├── auth/            # Authentication
│   │   │   ├── components/  # LoginForm, RegisterForm, etc.
│   │   │   ├── hooks/       # useAuth, useLogin, etc.
│   │   │   ├── services/    # Auth API calls
│   │   │   ├── types/       # Auth types
│   │   │   └── pages/       # LoginPage, RegisterPage, OTPPage
│   │   │
│   │   ├── chat/            # Real-time messaging
│   │   │   ├── components/  # ChatList, ChatWindow, MessageBubble
│   │   │   ├── hooks/       # useChat, useSocket, useMessages
│   │   │   ├── services/    # Chat API calls
│   │   │   ├── types/       # Message, ChatRoom types
│   │   │   └── store/       # Chat Zustand store
│   │   │
│   │   ├── wallet/          # Wallet & transactions
│   │   │   ├── components/  # WalletBalance, TransactionList
│   │   │   ├── hooks/       # useWallet, useTransactions
│   │   │   ├── services/    # Wallet API calls
│   │   │   ├── types/       # Wallet, Transaction types
│   │   │   └── store/        # Wallet Zustand store
│   │   │
│   │   ├── profile/         # User profiles
│   │   │   ├── components/  # ProfileCard, ProfileForm, PhotoUpload
│   │   │   ├── hooks/       # useProfile, useUpdateProfile
│   │   │   ├── services/    # Profile API calls
│   │   │   ├── types/       # Profile types
│   │   │   └── store/       # Profile Zustand store
│   │   │
│   │   ├── payment/         # Coin purchase & payments
│   │   │   ├── components/  # CoinPlanCard, PaymentForm
│   │   │   ├── hooks/       # usePayment, useRazorpay
│   │   │   ├── services/    # Payment API & Razorpay
│   │   │   └── types/       # Payment, CoinPlan types
│   │   │
│   │   ├── admin/           # Admin panel
│   │   │   ├── components/  # Admin UI components
│   │   │   ├── hooks/       # Admin hooks
│   │   │   ├── services/    # Admin API calls
│   │   │   ├── types/       # Admin types
│   │   │   └── pages/       # AdminDashboard, UserManagement, etc.
│   │   │
│   │   ├── discovery/       # Location-based discovery
│   │   │       ├── components/  # ProfileCard, FilterPanel
│   │   │       ├── hooks/       # useNearbyFemales, useFilters
│   │   │       ├── services/    # Discovery API calls
│   │   │       └── types/       # NearbyUser, FilterOptions types
│   │   │
│   │   ├── male/            # Male user pages & components
│   │   │   ├── components/  # Male-specific UI components
│   │   │   ├── hooks/       # Male-specific hooks
│   │   │   ├── services/    # Male-specific API calls
│   │   │   ├── types/       # Male-specific types
│   │   │   └── pages/       # MaleDashboard, NearbyFemalesPage, ChatListPage, ChatWindowPage, WalletPage, CoinPurchasePage
│   │   │
│   │   └── female/          # Female user pages & components
│   │       ├── components/  # Female-specific UI components
│   │       ├── hooks/       # Female-specific hooks
│   │       ├── services/    # Female-specific API calls
│   │       ├── types/       # Female-specific types
│   │       └── pages/       # FemaleDashboard, ChatListPage, ChatWindowPage, EarningsPage, WithdrawalPage, AutoMessageTemplatesPage
│   │
│   ├── shared/              # Shared resources
│   │   ├── components/
│   │   │   ├── ui/          # Button, Input, Modal, Card, Avatar, Badge, etc.
│   │   │   └── layout/      # Header, Footer, Sidebar, Navigation
│   │   ├── hooks/           # useGeolocation, useDebounce, useLocalStorage
│   │   ├── utils/           # formatters.ts, validators.ts, helpers.ts
│   │   ├── types/           # Shared TypeScript types
│   │   ├── constants/       # App-wide constants
│   │   └── config/          # Configuration files
│   │
│   ├── core/                # Core infrastructure
│   │   ├── api/             # Axios client, interceptors, endpoints
│   │   ├── store/           # Global Zustand stores (authStore, appStore)
│   │   ├── routes/          # Route definitions, route guards
│   │   ├── layouts/         # AuthLayout, MaleLayout, FemaleLayout, AdminLayout
│   │   └── providers/       # ThemeProvider, SocketProvider, AuthProvider
│   │
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
│
├── .env.example             # Environment variables template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md                # Main documentation
├── STRUCTURE.md             # This file
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Module Organization Principles

### 1. Feature-Based Modules (`/features/`)
Each feature is **self-contained** with:
- Its own components, hooks, services, types
- Minimal dependencies on other features
- Can be easily added/removed without affecting others

**Example: Adding a new feature**
```
src/features/new-feature/
├── components/
├── hooks/
├── services/
├── types/
└── index.ts (optional exports)
```

### 2. Shared Resources (`/shared/`)
- Reusable across **all features**
- Base UI components
- Common utilities
- Shared types and constants
- **Never** feature-specific logic

### 3. Core Infrastructure (`/core/`)
- App-level setup
- Global state management
- Routing configuration
- API client configuration
- Provider setup

## Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

| Alias | Path | Usage |
|-------|------|-------|
| `@/` | `src/` | General imports |
| `@features/` | `src/features/` | Feature imports |
| `@shared/` | `src/shared/` | Shared imports |
| `@core/` | `src/core/` | Core imports |

**Example:**
```typescript
// Feature import
import { useAuth } from '@features/auth/hooks/useAuth'

// Shared import
import { Button } from '@shared/components/ui/Button'

// Core import
import { api } from '@core/api/client'
```

## Adding a New Feature

1. **Create feature folder:**
   ```
   src/features/new-feature/
   ├── components/
   ├── hooks/
   ├── services/
   └── types/
   ```

2. **Add feature-specific code** in respective folders

3. **Import using path alias:**
   ```typescript
   import { NewFeatureComponent } from '@features/new-feature/components/NewFeatureComponent'
   ```

4. **Add routes** in `@core/routes/AppRoutes.tsx` if needed

5. **Add to navigation** in appropriate layout

## Removing a Feature

1. Delete the feature folder: `src/features/feature-name/`
2. Remove imports from other files
3. Remove routes from `@core/routes/AppRoutes.tsx`
4. Remove navigation items from layouts

## Best Practices

1. **Keep features independent** - Minimize cross-feature dependencies
2. **Use shared resources** - Don't duplicate common components
3. **Type everything** - Use TypeScript types in each feature's `types/` folder
4. **Consistent naming** - Follow existing patterns
5. **Document complex logic** - Add comments where needed
6. **Export from index** - Use `index.ts` files for cleaner imports (optional)

## Technology Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time
- **React Hook Form** + **Zod** - Forms & validation

