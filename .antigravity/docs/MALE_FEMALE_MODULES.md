# Male & Female Modules Guide

## Overview

Male and female user-specific pages and components are organized in separate feature modules for better code organization and role-based separation.

## Male Module

**Location:** `src/features/male/`

### Pages (`src/features/male/pages/`)
Create these pages here:
- ✅ `MaleDashboard.tsx` - Main dashboard with wallet balance, quick stats
- ✅ `NearbyFemalesPage.tsx` - Location-based discovery of nearby females
- ✅ `ChatListPage.tsx` - List of active conversations
- ✅ `ChatWindowPage.tsx` - Individual chat window (uses chat feature components)
- ✅ `WalletPage.tsx` - Wallet balance and transaction history
- ✅ `CoinPurchasePage.tsx` - Coin plan selection and purchase

### Components (`src/features/male/components/`)
Male-specific UI components that are not shared:
- Dashboard widgets
- Male-specific navigation components
- Male-specific profile cards
- Any other male-only UI elements

### Hooks (`src/features/male/hooks/`)
Male-specific React hooks:
- `useMaleDashboard.ts` - Dashboard data fetching
- `useNearbyFemales.ts` - Discovery logic
- Any other male-specific hooks

### Services (`src/features/male/services/`)
Male-specific API calls:
- `maleService.ts` - API functions specific to male users

### Types (`src/features/male/types/`)
Male-specific TypeScript types:
- `male.types.ts` - Type definitions for male features

### Usage Example
```typescript
// Import male page
import { MaleDashboard } from '@features/male/pages/MaleDashboard'

// Import male component
import { MaleNavBar } from '@features/male/components/MaleNavBar'
```

---

## Female Module

**Location:** `src/features/female/`

### Pages (`src/features/female/pages/`)
Create these pages here:
- ✅ `FemaleDashboard.tsx` - Main dashboard with earnings, stats
- ✅ `ChatListPage.tsx` - List of active conversations
- ✅ `ChatWindowPage.tsx` - Individual chat window (free messaging)
- ✅ `EarningsPage.tsx` - Earnings overview, charts, breakdown
- ✅ `WithdrawalPage.tsx` - Withdrawal request form and history
- ✅ `AutoMessageTemplatesPage.tsx` - Auto-message template management

### Components (`src/features/female/components/`)
Female-specific UI components that are not shared:
- Earnings widgets
- Withdrawal form components
- Auto-message template components
- Female-specific navigation components
- Any other female-only UI elements

### Hooks (`src/features/female/hooks/`)
Female-specific React hooks:
- `useFemaleDashboard.ts` - Dashboard data fetching
- `useEarnings.ts` - Earnings calculations
- `useWithdrawal.ts` - Withdrawal logic
- `useAutoMessages.ts` - Auto-message management
- Any other female-specific hooks

### Services (`src/features/female/services/`)
Female-specific API calls:
- `femaleService.ts` - API functions specific to female users
- `withdrawalService.ts` - Withdrawal API calls
- `autoMessageService.ts` - Auto-message API calls

### Types (`src/features/female/types/`)
Female-specific TypeScript types:
- `female.types.ts` - Type definitions for female features
- `withdrawal.types.ts` - Withdrawal-related types
- `autoMessage.types.ts` - Auto-message types

### Usage Example
```typescript
// Import female page
import { FemaleDashboard } from '@features/female/pages/FemaleDashboard'

// Import female component
import { EarningsWidget } from '@features/female/components/EarningsWidget'
```

---

## Shared Features

Both male and female users share these feature modules:

### Chat Feature (`@features/chat/`)
- **Shared components:** ChatList, ChatWindow, MessageBubble, MessageInput
- **Usage:** Both male and female pages import from here
- **Note:** Payment logic is handled differently (male pays, female receives)

### Wallet Feature (`@features/wallet/`)
- **Shared components:** WalletBalance, TransactionList
- **Usage:** Both roles use wallet components, but display different data

### Profile Feature (`@features/profile/`)
- **Shared components:** ProfileCard, ProfileForm, PhotoUpload
- **Usage:** Both roles use profile components

### Discovery Feature (`@features/discovery/`)
- **Primarily used by:** Male users
- **Components:** ProfileCard, FilterPanel
- **Usage:** Male users discover nearby females

### Payment Feature (`@features/payment/`)
- **Primarily used by:** Male users
- **Components:** CoinPlanCard, PaymentForm
- **Usage:** Male users purchase coins

---

## Module Dependencies

### Male Module Dependencies
- ✅ `@features/chat` - For messaging
- ✅ `@features/wallet` - For wallet display
- ✅ `@features/payment` - For coin purchases
- ✅ `@features/discovery` - For finding nearby females
- ✅ `@features/profile` - For profile management
- ✅ `@shared/components/ui` - For base UI components

### Female Module Dependencies
- ✅ `@features/chat` - For messaging (free)
- ✅ `@features/wallet` - For wallet display
- ✅ `@features/profile` - For profile management
- ✅ `@shared/components/ui` - For base UI components

---

## File Organization Example

```
src/features/male/
├── pages/
│   ├── MaleDashboard.tsx
│   ├── NearbyFemalesPage.tsx
│   ├── ChatListPage.tsx
│   ├── ChatWindowPage.tsx
│   ├── WalletPage.tsx
│   └── CoinPurchasePage.tsx
├── components/
│   └── (male-specific components)
├── hooks/
│   └── (male-specific hooks)
├── services/
│   └── maleService.ts
└── types/
    └── male.types.ts

src/features/female/
├── pages/
│   ├── FemaleDashboard.tsx
│   ├── ChatListPage.tsx
│   ├── ChatWindowPage.tsx
│   ├── EarningsPage.tsx
│   ├── WithdrawalPage.tsx
│   └── AutoMessageTemplatesPage.tsx
├── components/
│   └── (female-specific components)
├── hooks/
│   └── (female-specific hooks)
├── services/
│   └── femaleService.ts
└── types/
    └── female.types.ts
```

---

## Quick Start

1. **Create a male page:**
   ```typescript
   // src/features/male/pages/MaleDashboard.tsx
   import { Button } from '@shared/components/ui/Button'
   import { WalletBalance } from '@features/wallet/components/WalletBalance'
   
   export const MaleDashboard = () => {
     // Your code here
   }
   ```

2. **Create a female page:**
   ```typescript
   // src/features/female/pages/FemaleDashboard.tsx
   import { Button } from '@shared/components/ui/Button'
   import { WalletBalance } from '@features/wallet/components/WalletBalance'
   
   export const FemaleDashboard = () => {
     // Your code here
   }
   ```

3. **Import in routes:**
   ```typescript
   // src/core/routes/AppRoutes.tsx
   import { MaleDashboard } from '@features/male/pages/MaleDashboard'
   import { FemaleDashboard } from '@features/female/pages/FemaleDashboard'
   ```

