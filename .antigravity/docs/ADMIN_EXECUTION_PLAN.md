# Admin Dashboard - Execution Plan

> **Created**: 2024-01-15
> **Status**: Planning Phase

---

## 📋 Executive Summary

This document outlines the comprehensive execution plan for building the Admin Dashboard module, including all workflows, controls, parameters, and features required for platform management.

---

## 🎯 Admin Module Overview

The Admin Dashboard provides comprehensive platform management capabilities including:
- **User Management** (Male & Female)
- **Female Approval Workflow**
- **Coin Economy Management**
- **Withdrawal Processing**
- **Transaction Monitoring**
- **System Settings**
- **Audit Logging**

---

## 🔄 Admin Workflows

### 1. Admin-Female Workflow

#### Female Approval Workflow
1. **Pending Approval List**
   - View all pending female registrations
   - Filter by registration date, location, profile completeness
   - Sort by priority/date

2. **Profile Review**
   - View complete profile (photos, bio, personal info)
   - Check verification documents (if any)
   - Review profile completeness
   - Assess photo quality and appropriateness
   - Evaluate bio content

3. **Approval Actions**
   - **Approve**: Set `approvalStatus = "approved"`, allow platform access
   - **Reject**: Set `approvalStatus = "rejected"`, provide rejection reason
   - **Request More Info**: Send notification for additional documents/info
   - **Bulk Approval**: Approve multiple profiles at once

4. **Post-Approval**
   - Track approval history
   - Monitor approved female activity
   - Handle appeals/re-applications

#### Female Withdrawal Management
1. **Withdrawal Request Review**
   - View withdrawal requests with filters (status, date, amount)
   - Review user profile and earnings history
   - Verify payout method details (UPI/Bank)

2. **Withdrawal Processing**
   - **Approve**: Deduct coins, calculate INR based on PayoutSlab
   - **Reject**: Provide reason, return coins to user
   - **Request Info**: Ask for additional bank/UPI details
   - **Mark as Paid**: After manual transfer completion

3. **Withdrawal Tracking**
   - Monitor withdrawal status
   - Track processing times
   - Export withdrawal reports

### 2. Admin-Male Workflow

#### Male User Management
1. **User Overview**
   - View all male users with filters
   - Search by name/email/phone
   - Filter by status (active/blocked), verification, registration date

2. **User Actions**
   - **Block/Unblock**: Restrict platform access
   - **Verify**: Mark user as verified
   - **View Details**: Profile, activity, transactions, location
   - **Delete**: Remove user (with confirmation)

3. **Monitoring**
   - Track user activity
   - Monitor transaction history
   - View location data
   - Review chat activity summary

#### Male Transaction Monitoring
1. **Transaction Overview**
   - View all transactions (purchases, messages, video calls)
   - Filter by type, date, user, amount
   - Search by transaction ID

2. **Transaction Analysis**
   - Revenue trends
   - User spending patterns
   - Platform profit calculations
   - Export transaction reports

### 3. Admin-Platform Workflow

#### Coin Economy Management
1. **Coin Plans Management**
   - **CRUD Operations**:
     - Create new coin plans (tier, price, coins, bonus)
     - Edit existing plans
     - Delete/Disable plans
     - Set display order
   - **Plan Configuration**:
     - Plan name/tier (basic, silver, gold, platinum)
     - Price in INR
     - Base coins amount
     - Bonus percentage/amount
     - Popular/Best Value badges
     - Active/Inactive status

2. **Payout Slabs Management**
   - **CRUD Operations**:
     - Create payout slabs (min/max coins, percentage)
     - Edit existing slabs
     - Delete slabs
     - Set display order
   - **Slab Configuration**:
     - Minimum coins threshold
     - Maximum coins threshold (null for unlimited)
     - Payout percentage (40%, 50%, 60%, 70%)
     - Display order

3. **Message Cost Settings**
   - **Tier-Based Costs**:
     - Basic tier: 20 coins per message
     - Silver tier: 18 coins per message
     - Gold tier: 16 coins per message
     - Platinum tier: 12 coins per message
   - **Video Call Costs**: 500 coins per call
   - **Update Costs**: Modify tier costs dynamically

4. **Withdrawal Settings**
   - Minimum withdrawal amount
   - Maximum withdrawal amount
   - Withdrawal processing fee
   - Daily/weekly withdrawal limits

#### System Settings Management
1. **General Settings**
   - Platform name
   - Support email
   - Support phone
   - Terms of service URL
   - Privacy policy URL
   - Maintenance mode toggle
   - Registration enabled toggle

2. **Notification Settings**
   - Email notification configuration
   - SMS notification configuration
   - Push notification settings

3. **Security Settings**
   - Rate limiting configuration
   - Session timeout settings
   - Password policy settings

#### Audit Logging
1. **Log Tracking**
   - All admin actions logged automatically
   - Action type (create, update, delete, approve, reject, block, etc.)
   - Admin who performed action
   - Target user (if applicable)
   - Timestamp
   - Details/Changes
   - IP address

2. **Log Management**
   - View audit logs with filters
   - Search by action type, admin, target user, date
   - Export audit logs
   - Monitor system changes

---

## 🎛️ Admin Controls & Parameters

### User Management Controls
- **Block/Unblock Users**: Toggle user access to platform
- **Verify Users**: Mark users as verified
- **Delete Users**: Remove users from platform (with confirmation)
- **View User Details**: Access complete user information
- **Search & Filter**: Find users by various criteria
- **Export User Data**: Download user information

### Female Approval Controls
- **Approve Female**: Grant platform access
- **Reject Female**: Deny access with reason
- **Request More Info**: Ask for additional documents
- **Bulk Approval**: Approve multiple profiles
- **View Profile**: Review complete profile details
- **Track History**: View approval/rejection history

### Coin Economy Controls
- **Create Coin Plans**: Add new purchase plans
- **Edit Coin Plans**: Modify existing plans
- **Delete Coin Plans**: Remove plans
- **Enable/Disable Plans**: Toggle plan availability
- **Create Payout Slabs**: Add new payout tiers
- **Edit Payout Slabs**: Modify payout percentages
- **Delete Payout Slabs**: Remove slabs
- **Update Message Costs**: Change tier-based costs
- **Update Video Call Costs**: Modify call pricing
- **Configure Withdrawal Settings**: Set limits and fees

### Withdrawal Management Controls
- **Approve Withdrawal**: Process withdrawal request
- **Reject Withdrawal**: Deny with reason
- **Request More Info**: Ask for additional details
- **Mark as Paid**: Confirm payment completion
- **Bulk Actions**: Process multiple withdrawals
- **Export Reports**: Download withdrawal data

### System Settings Controls
- **Update General Settings**: Modify platform configuration
- **Configure Notifications**: Set up email/SMS/push
- **Manage Security**: Configure rate limits, sessions
- **Toggle Features**: Enable/disable platform features
- **Reset to Defaults**: Restore default settings

---

## 📊 Admin Dashboard Features

### Dashboard Overview
1. **Key Metrics Cards**
   - Total Users (Male/Female breakdown)
   - Active Users (last 24h/7d/30d)
   - Total Revenue (deposits, payouts, profit)
   - Pending Withdrawals Count
   - Total Transactions
   - Platform Profit (deposits - payouts)

2. **Charts & Visualizations**
   - User Growth Over Time (line chart)
   - Revenue Trends (area chart)
   - Activity Metrics (bar chart)
   - Coin Economy Statistics (pie chart)
   - Withdrawal Status Distribution (donut chart)
   - Transaction Type Breakdown (bar chart)

3. **Quick Actions**
   - Navigate to User Management
   - Navigate to Pending Approvals
   - Navigate to Withdrawal Requests
   - Navigate to Settings
   - View Recent Activity Feed

4. **Recent Activity Feed**
   - Latest admin actions
   - Recent user registrations
   - Pending approvals
   - Recent withdrawals
   - System notifications

---

## 🏗️ Architecture & Structure

### Page Structure
```
src/module/admin/
├── pages/
│   ├── AdminDashboard.tsx          # Main dashboard with stats & charts
│   ├── UsersManagementPage.tsx    # User list, search, filters, actions
│   ├── FemaleApprovalPage.tsx     # Pending approvals, review, approve/reject
│   ├── CoinEconomyPage.tsx        # Coin plans, payout slabs, message costs
│   ├── WithdrawalManagementPage.tsx # Withdrawal requests, approve/reject/mark paid
│   ├── TransactionsPage.tsx        # Transaction history, filters, export
│   ├── SettingsPage.tsx            # System settings, configuration
│   └── AuditLogsPage.tsx           # Audit log history, filters, export
├── components/
│   ├── AdminTopNavbar.tsx          # Top navbar with logo & menu
│   ├── AdminSidebar.tsx            # Navigation sidebar
│   ├── StatsCard.tsx               # Metric display card
│   ├── UserTable.tsx               # User management table
│   ├── UserDetailModal.tsx         # User details modal
│   ├── ApprovalCard.tsx             # Female approval card
│   ├── CoinPlanEditor.tsx          # Coin plan editor form
│   ├── PayoutSlabEditor.tsx       # Payout slab editor form
│   ├── WithdrawalRequestCard.tsx   # Withdrawal request card
│   ├── TransactionTable.tsx        # Transaction table
│   ├── SettingsForm.tsx            # Settings form
│   ├── AuditLogTable.tsx           # Audit log table
│   └── ChartComponent.tsx           # Chart visualization (recharts)
├── hooks/
│   ├── useAdminNavigation.ts       # Navigation state management
│   ├── useAdminDashboard.ts       # Dashboard data fetching
│   ├── useUserManagement.ts       # User management logic
│   ├── useFemaleApproval.ts       # Female approval logic
│   ├── useCoinEconomy.ts          # Coin economy management
│   ├── useWithdrawalManagement.ts # Withdrawal management
│   ├── useTransactions.ts          # Transaction data
│   ├── useSettings.ts              # Settings management
│   └── useAuditLogs.ts             # Audit log data
├── services/
│   ├── adminService.ts             # Main admin API service
│   ├── userManagementService.ts    # User management API calls
│   ├── femaleApprovalService.ts    # Female approval API calls
│   ├── coinEconomyService.ts       # Coin economy API calls
│   ├── withdrawalManagementService.ts # Withdrawal management API calls
│   ├── transactionService.ts       # Transaction API calls
│   ├── settingsService.ts          # Settings API calls
│   └── auditLogService.ts          # Audit log API calls
└── types/
    └── admin.types.ts              # Admin-specific TypeScript types
```

---

## 🎨 Design Guidelines

### Layout Inspiration
- **Top Navbar**: Similar to Male/Female dashboards (logo + hamburger menu)
- **Sidebar Navigation**: Right-side slide-in menu (like Male/Female)
- **Bottom Navigation**: Not needed for admin (desktop-focused)
- **Card-Based Layout**: Stats cards, action cards (inspired by dashboards)
- **Table Layouts**: For user lists, transactions, audit logs
- **Modal Forms**: For editing coin plans, payout slabs, settings

### Color Scheme
- **Primary**: Professional blue/gray (admin-focused, not pink/yellow)
- **Success**: Green (for approvals, positive metrics)
- **Warning**: Orange/Yellow (for pending items)
- **Error**: Red (for rejections, errors)
- **Info**: Blue (for information, neutral actions)

### UI Components
- **Data Tables**: Sortable, filterable, paginated
- **Charts**: Line, bar, pie, area charts for analytics
- **Forms**: Inline editing, modal forms for settings
- **Cards**: Metric cards, action cards, info cards
- **Modals**: User details, approval review, settings

---

## 📡 API Endpoints Reference

### Dashboard
- `GET /api/admin/dashboard` - Overview stats (deposits, payouts, profit)

### User Management
- `GET /api/admin/users` - List users with filters
- `GET /api/admin/users/:id` - User details
- `POST /api/admin/users/:id/block` - Block/unblock user

### Female Approval
- `GET /api/admin/females/pending` - Pending approval list
- `POST /api/admin/females/:id/approve` - Approve female
- `POST /api/admin/females/:id/reject` - Reject female

### Coin Economy
- `GET /api/admin/coin-plans` - Coin plans list
- `POST /api/admin/coin-plans` - Create coin plan
- `PUT /api/admin/coin-plans/:id` - Update coin plan
- `DELETE /api/admin/coin-plans/:id` - Delete coin plan
- `GET /api/admin/payout-slabs` - Payout slabs
- `POST /api/admin/payout-slabs` - Create payout slab
- `PUT /api/admin/payout-slabs/:id` - Update payout slab
- `DELETE /api/admin/payout-slabs/:id` - Delete payout slab
- `PUT /api/admin/settings/message-costs` - Update tier costs

### Withdrawal Management
- `GET /api/admin/withdrawals` - Withdrawal requests
- `POST /api/admin/withdrawals/:id/approve` - Approve withdrawal
- `POST /api/admin/withdrawals/:id/reject` - Reject withdrawal
- `PUT /api/admin/withdrawals/:id/mark-paid` - Mark as paid

### Transactions
- `GET /api/admin/transactions` - Transaction history

### Settings
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

### Audit Logs
- `GET /api/admin/audit-logs` - Audit log history

---

## 📝 Type Definitions

### Admin Dashboard Data
```typescript
interface AdminDashboardData {
  stats: {
    totalUsers: { male: number; female: number; total: number };
    activeUsers: { last24h: number; last7d: number; last30d: number };
    revenue: { deposits: number; payouts: number; profit: number };
    pendingWithdrawals: number;
    totalTransactions: number;
  };
  charts: {
    userGrowth: Array<{ date: string; count: number }>;
    revenueTrends: Array<{ date: string; deposits: number; payouts: number }>;
    activityMetrics: Array<{ type: string; count: number }>;
  };
  recentActivity: ActivityItem[];
}
```

### User Management
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'male' | 'female';
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  profile?: UserProfile;
}

interface UserProfile {
  age: number;
  city: string;
  bio: string;
  photos: string[];
  location?: { lat: number; lng: number };
}
```

### Female Approval
```typescript
interface FemaleApproval {
  userId: string;
  user: User;
  profile: UserProfile;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}
```

### Coin Economy
```typescript
interface CoinPlan {
  id: string;
  name: string;
  tier: 'basic' | 'silver' | 'gold' | 'platinum';
  priceInINR: number;
  baseCoins: number;
  bonusCoins: number;
  totalCoins: number;
  isActive: boolean;
  displayOrder: number;
  badge?: 'POPULAR' | 'BEST VALUE';
}

interface PayoutSlab {
  id: string;
  minCoins: number;
  maxCoins: number | null;
  payoutPercentage: number;
  displayOrder: number;
}

interface MessageCosts {
  basic: number;
  silver: number;
  gold: number;
  platinum: number;
  videoCall: number;
}
```

### Withdrawal Management
```typescript
interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  coinsRequested: number;
  payoutMethod: 'UPI' | 'bank';
  payoutDetails: {
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  payoutAmountINR: number;
  payoutPercentage: number;
  createdAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  paidAt?: string;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'purchase' | 'message_spent' | 'message_earned' | 'withdrawal' | 'adjustment';
  amountCoins: number;
  amountINR?: number;
  direction: 'credit' | 'debit';
  createdAt: string;
  relatedUserId?: string;
  relatedMessageId?: string;
}
```

### Settings
```typescript
interface AdminSettings {
  general: {
    platformName: string;
    supportEmail: string;
    supportPhone: string;
    termsOfServiceUrl: string;
    privacyPolicyUrl: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  withdrawal: {
    minAmount: number;
    maxAmount: number;
    processingFee: number;
    dailyLimit: number;
    weeklyLimit: number;
  };
  messageCosts: MessageCosts;
}
```

### Audit Log
```typescript
interface AuditLog {
  id: string;
  action: string;
  adminId: string;
  adminName: string;
  targetUserId?: string;
  targetUserName?: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress: string;
}
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (High Priority)
1. **Types & Services**
   - Create `admin.types.ts` with all type definitions
   - Create service files for API calls
   - Set up mock data structure

2. **Navigation & Layout**
   - Create `AdminTopNavbar` component
   - Create `AdminSidebar` component
   - Create `useAdminNavigation` hook
   - Set up routing structure

3. **Admin Dashboard Page**
   - Create `AdminDashboard.tsx`
   - Implement stats cards
   - Add charts (using recharts)
   - Add quick actions
   - Add recent activity feed

### Phase 2: User Management (High Priority)
1. **Users Management Page**
   - Create `UsersManagementPage.tsx`
   - Implement user table with filters
   - Add search functionality
   - Add user detail modal
   - Implement block/unblock actions
   - Add export functionality

### Phase 3: Female Workflow (High Priority)
1. **Female Approval Page**
   - Create `FemaleApprovalPage.tsx`
   - Implement pending approval list
   - Add profile review interface
   - Implement approve/reject actions
   - Add bulk approval

2. **Withdrawal Management Page**
   - Create `WithdrawalManagementPage.tsx`
   - Implement withdrawal request list
   - Add filters and search
   - Implement approve/reject/mark paid actions
   - Add export reports

### Phase 4: Coin Economy (Medium Priority)
1. **Coin Economy Page**
   - Create `CoinEconomyPage.tsx`
   - Implement coin plan CRUD
   - Implement payout slab CRUD
   - Add message cost settings
   - Add withdrawal settings

### Phase 5: Monitoring & Settings (Medium Priority)
1. **Transactions Page**
   - Create `TransactionsPage.tsx`
   - Implement transaction table
   - Add filters and search
   - Add export functionality

2. **Settings Page**
   - Create `SettingsPage.tsx`
   - Implement settings form
   - Add category tabs
   - Add save/reset functionality

3. **Audit Logs Page**
   - Create `AuditLogsPage.tsx`
   - Implement audit log table
   - Add filters and search
   - Add export functionality

### Phase 6: Polish & Testing (Low Priority)
1. **Component Refinement**
   - Optimize components
   - Add loading states
   - Add error handling
   - Improve accessibility

2. **Testing**
   - Unit tests for components
   - Integration tests for workflows
   - E2E tests for critical paths

---

## ✅ Success Criteria

### Functional Requirements
- ✅ All admin pages implemented and functional
- ✅ User management fully operational
- ✅ Female approval workflow complete
- ✅ Coin economy management functional
- ✅ Withdrawal management operational
- ✅ Transaction monitoring working
- ✅ Settings management functional
- ✅ Audit logging working

### Non-Functional Requirements
- ✅ Responsive design (desktop-first, mobile-friendly)
- ✅ Fast page load times
- ✅ Smooth navigation
- ✅ Intuitive UI/UX
- ✅ Error handling and validation
- ✅ Loading states for async operations
- ✅ Accessible (WCAG 2.1 AA)

---

## 📌 Notes

- Admin module is completely new and needs to be built from scratch
- Layout inspired by Male/Female dashboards but unique for admin needs
- Desktop-first design (admin typically uses desktop)
- Professional color scheme (not pink/yellow like user dashboards)
- All admin actions must be logged in audit logs
- Mock data structure should match expected API responses
- Components should be reusable and well-structured
- TypeScript types should be comprehensive

---

## 🎯 Next Steps

1. **Review this plan** with stakeholders
2. **Get approval** to proceed
3. **Start Phase 1** implementation
4. **Iterate** based on feedback
5. **Complete** all phases systematically

---

**Ready to proceed?** Once approved, we'll start with Phase 1: Foundation.

