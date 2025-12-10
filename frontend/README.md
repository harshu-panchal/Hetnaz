# MatchMint Dating App - Frontend

## Project Structure

This frontend is built with a **modular, feature-based architecture** for easy maintenance and scalability.

### Architecture Overview

```
frontend/
├── src/
│   ├── features/          # Feature modules (self-contained)
│   ├── shared/            # Shared utilities, components, hooks
│   ├── core/              # Core app infrastructure
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── public/                # Static assets
└── Configuration files
```

## Folder Structure

### `/src/features/` - Feature Modules

Each feature is self-contained with its own:
- `components/` - Feature-specific UI components
- `hooks/` - Feature-specific React hooks
- `services/` - API service functions
- `types/` - TypeScript types/interfaces
- `store/` - Zustand store (if needed)
- `pages/` - Page components (if feature has pages)

**Features:**
- `auth/` - Authentication (login, register, OTP)
- `chat/` - Real-time messaging
- `wallet/` - Wallet management, transactions
- `profile/` - User profiles, settings
- `payment/` - Coin purchase, Razorpay integration
- `admin/` - Admin panel features
- `discovery/` - Location-based discovery, matching
- `male/` - Male user pages and components
- `female/` - Female user pages and components

### `/src/shared/` - Shared Resources

Reusable across all features:
- `components/ui/` - Base UI components (Button, Input, Modal, etc.)
- `components/layout/` - Layout components (Header, Footer, etc.)
- `hooks/` - Shared React hooks
- `utils/` - Utility functions (formatters, validators, helpers)
- `types/` - Shared TypeScript types
- `constants/` - App constants
- `config/` - Configuration files

### `/src/core/` - Core Infrastructure

App-level infrastructure:
- `api/` - Axios instance, interceptors, API configuration
- `store/` - Global Zustand stores (auth, etc.)
- `routes/` - Route definitions, route guards
- `layouts/` - Layout wrappers (AuthLayout, MaleLayout, etc.)
- `providers/` - Context providers (Theme, Socket, etc.)

## Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

- `@/` → `src/`
- `@features/` → `src/features/`
- `@shared/` → `src/shared/`
- `@core/` → `src/core/`

**Usage:**
```typescript
import { Button } from '@shared/components/ui/Button'
import { useAuth } from '@features/auth/hooks/useAuth'
import { api } from '@core/api/client'
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## Adding a New Feature

1. Create feature folder: `src/features/new-feature/`
2. Add subfolders: `components/`, `hooks/`, `services/`, `types/`
3. Export from feature index if needed
4. Import using path alias: `@features/new-feature/...`

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

