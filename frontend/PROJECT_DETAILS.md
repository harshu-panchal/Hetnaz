# MatchMint Dating App - Project Details

## Overview

MatchMint is a dating application that connects male and female users through messaging and video calls. The platform operates on a coin-based economy where male users purchase coins to send messages and initiate video calls, while female users earn coins from these interactions.

---

## Key Business Rules

### Coin System
- **Messaging**: Each message sent by a male user costs **50 coins**
- **Video Calls**: Each video call initiated by a male user costs **500 coins**
- **Location**: Location is **not a constraint** for discovering profiles. Users can chat regardless of their physical distance
- **Location Usage**: Location data is used for:
  - Backend information and analytics
  - Admin reference and monitoring
  - Displaying distance information in dashboards (showing how far profiles are, but not restricting access)

---

## Features

### Core Features
1. **User Authentication** - Login, registration, and profile management
2. **Profile Discovery** - Browse and discover profiles (location-based display, not restriction)
3. **Messaging** - Real-time text messaging between users
4. **Video Calls** - Video call functionality for male users (premium feature)
5. **Coin Economy** - Purchase and manage coins for male users
6. **Earnings System** - Track and withdraw earnings for female users
7. **Wallet Management** - View balance, transactions, and purchase history
8. **Notifications** - Real-time updates and alerts
9. **Admin Panel** - Management dashboard for platform administration

---

## User Roles

### 1. Male Users
Male users purchase coins to send messages and initiate video calls with female users.

### 2. Female Users
Female users receive coins when male users interact with them. They can track earnings and request withdrawals.

### 3. Admin
Administrators manage the platform, monitor users, handle withdrawals, and configure settings.

---

## Screens & Workflows

---

## MALE USER SCREENS

### 1. Male Dashboard
**Purpose**: Main landing page showing overview of account status and quick access to key features.

**Elements**:
- Profile header with user name, avatar, premium status, and online indicator
- Notification bell icon
- Wallet balance display with "Top Up" button
- Stats grid showing:
  - Total matches
  - Messages sent
  - Profile views
- Discover nearby card with preview of nearby female profiles
- Active chats list (showing last 3 conversations)
- Bottom navigation bar (Discover, Chats, Wallet, Profile)

**Operations**:
- View wallet balance
- Navigate to coin purchase page
- View notifications
- Navigate to discover page
- View and open active chats
- Navigate to different sections via bottom navigation

---

### 2. Discover/Nearby Females Page
**Purpose**: Browse and discover female profiles to start conversations.

**Elements**:
- Top app bar with "Nearby" title, search icon, and filter icon
- Search bar for searching profiles by name, occupation, or bio
- Filter chips (All, Online, New, Popular)
- Filter panel with advanced options:
  - Age range slider
  - Maximum distance filter
  - Online only toggle
  - Verified only toggle
- Profile grid showing female profiles with:
  - Profile photo
  - Name and age
  - Distance from user
  - Online status indicator
  - Occupation (if available)
  - Bio (if available)
- Floating action button for "Get Coins"
- Bottom navigation bar

**Operations**:
- Search for profiles
- Apply filters (age, distance, online status, verified status)
- View profile details
- Start a chat with a profile
- Navigate to coin purchase page
- Navigate to other sections via bottom navigation

**Note**: Location is displayed for reference but does not restrict who users can chat with.

---

### 3. Chat List Page
**Purpose**: View all active conversations and manage chats.

**Elements**:
- Chat list header with coin balance display and edit button
- Search bar for searching chats
- Section title "Active Conversations"
- Chat list items showing:
  - User avatar and name
  - Last message preview
  - Timestamp
  - Online status indicator
  - Unread message badge (if applicable)
  - VIP badge (if applicable)
  - Message type indicator (text, photo)
  - Read status indicators
- Edit chat modal for creating new chats
- Bottom navigation bar

**Operations**:
- Search chats by name or message content
- Open a chat conversation
- Create new chat
- View coin balance
- Navigate to different sections via bottom navigation

---

### 4. Chat Window Page
**Purpose**: Individual chat conversation with messaging and video call functionality.

**Elements**:
- Chat header with:
  - User avatar and name
  - Online status indicator
  - VIP badge (if applicable)
  - More options menu
- Messages area displaying:
  - Sent messages (right-aligned, shows coin cost)
  - Received messages (left-aligned)
  - Message timestamps
  - Read status indicators (sent, delivered, read)
  - Photo/image messages
- Message input area with:
  - Text input field
  - Photo attachment button
  - Send button
  - Coin cost indicator (50 coins per message)
  - Disabled state when insufficient coins
- Photo picker modal
- More options modal with:
  - View profile option
  - Block user option
  - Report user option
  - Delete chat option
- Video call button (costs 500 coins)

**Operations**:
- Send text messages (50 coins deducted per message)
- Send photo messages (50 coins deducted per photo)
- Initiate video call (500 coins deducted)
- View user profile
- Block or report user
- Delete chat conversation
- View message read status

**Business Rules**:
- Each message costs 50 coins
- Video call costs 500 coins
- Messages are disabled if coin balance is insufficient

---

### 5. Wallet Page
**Purpose**: View wallet balance, purchase coins, and manage transactions.

**Elements**:
- Wallet header with help icon
- Wallet balance card showing:
  - Current coin balance
  - Member tier (e.g., Gold Member)
  - User avatar
  - Value estimate in currency
  - Expiration days for coins
- "Buy Coins" button
- Quick actions grid:
  - MatchMint VIP membership
  - Send Gift option
- Transaction history section with:
  - Segmented controls (All, Purchased, Spent)
  - Transaction list showing:
    - Transaction type icon
    - Transaction title
    - Timestamp
    - Amount (positive for purchases/bonuses, negative for spending)
- Help modal
- Quick actions modal (VIP purchase, Send Gift)
- Bottom navigation bar

**Operations**:
- View current coin balance
- Navigate to coin purchase page
- View transaction history
- Filter transactions (all, purchased, spent)
- Access VIP membership options
- Send gifts to other users
- View help information
- Navigate to different sections via bottom navigation

---

### 6. Coin Purchase Page
**Purpose**: Select and purchase coin plans.

**Elements**:
- Coin purchase header with purchase history button
- Current balance display
- Promo banner with special offers
- Coin plan cards showing:
  - Plan tier (Basic, Silver, Gold, Platinum)
  - Price in INR
  - Number of coins
  - Bonus percentage (if applicable)
  - Popular/Best Value badges
  - Original price (if discounted)
- Payment method selector:
  - Apple Pay
  - Credit/Debit Card
  - UPI Apps
- Trust footer with security information

**Operations**:
- View current balance
- Select coin plan
- Choose payment method
- Navigate to payment page
- View purchase history
- Complete coin purchase

---

### 7. Payment Page
**Purpose**: Complete payment for selected coin plan.

**Elements**:
- Payment form with selected plan details
- Payment method selection
- Payment processing interface
- Success/error messages

**Operations**:
- Review selected plan
- Select payment method
- Complete payment transaction
- Receive coins after successful payment

---

### 8. Purchase History Page
**Purpose**: View all past coin purchases.

**Elements**:
- Header with back button
- List of past purchases showing:
  - Purchase date and time
  - Plan details
  - Amount paid
  - Coins received
  - Transaction status

**Operations**:
- View purchase history
- Filter or sort purchases
- View transaction details

---

### 9. User Profile Page
**Purpose**: View another user's profile details.

**Elements**:
- Profile header with user photo
- User information:
  - Name and age
  - Bio
  - Occupation
  - Location/distance
  - Online status
- Action buttons:
  - Send message
  - Start video call
- Photo gallery

**Operations**:
- View profile information
- Start chat conversation
- Initiate video call
- View photos

---

### 10. My Profile Page
**Purpose**: View and edit own profile.

**Elements**:
- Profile photo
- Personal information fields
- Edit button
- Settings options
- Account management options

**Operations**:
- View profile information
- Edit profile details
- Upload photos
- Update settings
- Manage account

---

### 11. Notifications Page
**Purpose**: View all notifications and alerts.

**Elements**:
- Notification list showing:
  - Notification type icon
  - Title and message
  - Timestamp
  - Read/unread indicator
  - Related user avatar (if applicable)
- Filter options
- Mark all as read option

**Operations**:
- View notifications
- Mark notifications as read
- Navigate to related content
- Filter notifications by type

---

## FEMALE USER SCREENS

### 1. Female Dashboard
**Purpose**: Main landing page showing earnings overview and quick access to features.

**Elements**:
- Profile header with user name, avatar, and online status
- Earnings summary card showing:
  - Total earnings
  - Available balance
  - Pending withdrawals
- Stats grid showing:
  - Total messages received
  - Active conversations
  - Profile views
- Quick actions:
  - View earnings
  - Request withdrawal
  - Manage auto-messages
- Active chats preview
- Bottom navigation bar

**Operations**:
- View earnings summary
- Navigate to earnings page
- Navigate to withdrawal page
- View active chats
- Navigate to different sections

---

### 2. Chat List Page (Female)
**Purpose**: View all active conversations.

**Elements**:
- Chat list header
- Search bar
- Chat list items showing:
  - User avatar and name
  - Last message preview
  - Timestamp
  - Unread message badge (if applicable)
- Bottom navigation bar

**Operations**:
- Search chats
- Open chat conversations
- View unread messages
- Navigate to different sections

---

### 3. Chat Window Page (Female)
**Purpose**: Individual chat conversation (free messaging for female users).

**Elements**:
- Chat header with user information
- Messages area (same as male version)
- Message input area (free for female users)
- Photo attachment option
- Video call receive option
- More options menu

**Operations**:
- Send messages (free)
- Send photos (free)
- Receive video calls
- View user profile
- Block or report user
- Delete chat

**Note**: Female users can message for free and receive coins when male users send messages or initiate video calls.

---

### 4. Earnings Page
**Purpose**: Detailed view of earnings, charts, and breakdown.

**Elements**:
- Earnings header
- Total earnings display
- Earnings chart/graph
- Earnings breakdown by:
  - Date range
  - Message type
  - User interactions
- Earnings history list
- Filter options (daily, weekly, monthly)

**Operations**:
- View total earnings
- View earnings charts
- Filter earnings by date range
- View detailed earnings breakdown
- Export earnings report

---

### 5. Withdrawal Page
**Purpose**: Request withdrawals and view withdrawal history.

**Elements**:
- Available balance display
- Withdrawal request form:
  - Amount input
  - Payment method selection
  - Bank account details (if applicable)
  - Submit button
- Withdrawal history list showing:
  - Request date
  - Amount
  - Status (pending, approved, completed, rejected)
  - Processing time
- Minimum withdrawal amount information

**Operations**:
- Request withdrawal
- View withdrawal history
- Track withdrawal status
- Update payment information

---

### 6. Auto-Message Templates Page
**Purpose**: Create and manage automated message responses.

**Elements**:
- Template list
- Create new template button
- Template editor with:
  - Template name
  - Message content
  - Trigger conditions
  - Enable/disable toggle
- Template actions (edit, delete, duplicate)

**Operations**:
- Create auto-message templates
- Edit existing templates
- Delete templates
- Enable/disable templates
- Set trigger conditions

---

### 7. My Profile Page (Female)
**Purpose**: View and edit own profile.

**Elements**:
- Profile photo gallery
- Personal information fields
- Bio editor
- Photo upload
- Privacy settings
- Account settings

**Operations**:
- Edit profile information
- Upload photos
- Update bio
- Manage privacy settings
- Update account settings

---

### 8. Notifications Page (Female)
**Purpose**: View notifications related to earnings, messages, and platform updates.

**Elements**:
- Notification list
- Filter options
- Mark as read functionality

**Operations**:
- View notifications
- Mark notifications as read
- Navigate to related content

---

## ADMIN SCREENS

### 1. Admin Dashboard
**Purpose**: Overview of platform statistics and key metrics.

**Elements**:
- Platform statistics:
  - Total users (male/female breakdown)
  - Active users
  - Total revenue
  - Pending withdrawals
- Charts and graphs:
  - User growth
  - Revenue trends
  - Activity metrics
- Quick actions:
  - User management
  - Withdrawal approvals
  - Settings

**Operations**:
- View platform statistics
- Monitor user activity
- Access management tools
- View reports and analytics

---

### 2. User Management Page
**Purpose**: Manage all users on the platform.

**Elements**:
- User list with filters:
  - Search by name/email
  - Filter by role (male/female)
  - Filter by status (active/blocked)
  - Filter by verification status
- User details showing:
  - Profile information
  - Account status
  - Activity history
  - Location information
- Action buttons:
  - Block/Unblock user
  - Verify user
  - View detailed profile
  - View transaction history

**Operations**:
- Search and filter users
- View user details
- Block or unblock users
- Verify user accounts
- View user activity and location data
- Manage user accounts

---

### 3. Female Approval Page
**Purpose**: Review and approve female user registrations.

**Elements**:
- Pending approval list
- User profile preview
- Approval/rejection buttons
- Review checklist

**Operations**:
- Review female user applications
- Approve or reject registrations
- View profile details
- Request additional information

---

### 4. Coin Economy Management Page
**Purpose**: Manage coin plans, pricing, and economy settings.

**Elements**:
- Coin plan list
- Plan editor:
  - Plan name
  - Price
  - Coin amount
  - Bonus percentage
- Payout slab configuration
- Economy settings

**Operations**:
- Create coin plans
- Edit existing plans
- Configure payout slabs
- Adjust economy settings

---

### 5. Withdrawal Management Page
**Purpose**: Review and process withdrawal requests from female users.

**Elements**:
- Withdrawal request list with filters:
  - Status filter (pending, approved, rejected)
  - Date range filter
  - Amount filter
- Request details showing:
  - User information
  - Requested amount
  - Payment method
  - Bank details
  - Request date
- Action buttons:
  - Approve withdrawal
  - Reject withdrawal
  - Request more information

**Operations**:
- View withdrawal requests
- Approve or reject withdrawals
- Process payments
- View withdrawal history
- Export withdrawal reports

---

### 6. Transaction History Page
**Purpose**: View all platform transactions.

**Elements**:
- Transaction list with filters:
  - Transaction type
  - Date range
  - User filter
  - Amount range
- Transaction details:
  - Transaction ID
  - User information
  - Transaction type
  - Amount
  - Timestamp
  - Status

**Operations**:
- View all transactions
- Filter transactions
- Export transaction reports
- View transaction details

---

### 7. Audit Logs Page
**Purpose**: Track all administrative actions and system events.

**Elements**:
- Audit log list
- Filter options:
  - Action type
  - User
  - Date range
- Log details showing:
  - Action performed
  - User who performed action
  - Timestamp
  - Details

**Operations**:
- View audit logs
- Filter logs
- Export logs
- Search logs

---

### 8. Settings Management Page
**Purpose**: Configure platform settings and preferences.

**Elements**:
- Settings categories:
  - General settings
  - Coin economy settings
  - Withdrawal settings
  - Notification settings
  - Security settings
- Configuration options
- Save button

**Operations**:
- Update platform settings
- Configure system parameters
- Save changes

---

## Key Workflows

### Messaging Workflow (Male User)
1. Male user opens chat list or discovers a profile
2. Selects a female user to chat with
3. Opens chat window
4. Types message (system checks coin balance)
5. If sufficient coins (50+), message is sent and 50 coins are deducted
6. If insufficient coins, user is prompted to purchase coins
7. Female user receives message and earns coins
8. Female user can respond for free

### Video Call Workflow (Male User)
1. Male user opens chat window
2. Clicks video call button
3. System checks coin balance (requires 500 coins)
4. If sufficient coins, call is initiated and 500 coins are deducted
5. Female user receives call notification
6. Female user accepts or declines call
7. If accepted, video call starts
8. Female user earns coins from the call

### Coin Purchase Workflow (Male User)
1. User navigates to wallet page
2. Clicks "Buy Coins" button
3. Selects coin plan on purchase page
4. Chooses payment method
5. Completes payment on payment page
6. Coins are added to wallet after successful payment
7. Transaction is recorded in purchase history

### Withdrawal Workflow (Female User)
1. Female user navigates to earnings page
2. Views total earnings and available balance
3. Navigates to withdrawal page
4. Enters withdrawal amount
5. Selects payment method and provides details
6. Submits withdrawal request
7. Admin reviews request
8. Admin approves or rejects withdrawal
9. If approved, payment is processed
10. User receives notification of withdrawal status

### Profile Discovery Workflow (Male User)
1. User navigates to discover page
2. Views list of female profiles
3. Can apply filters (age, distance, online status)
4. Can search for specific profiles
5. Location is displayed but does not restrict access
6. User can view profile details
7. User can start chat from profile or discovery page
8. Chat requires coins to send messages

### Admin User Management Workflow
1. Admin navigates to user management page
2. Searches or filters users
3. Views user details including location data
4. Can block/unblock users
5. Can verify user accounts
6. Can view user activity and transaction history
7. All actions are logged in audit logs

---

## Important Notes

### Location Handling
- **Location is NOT a constraint** for discovering or chatting with profiles
- Users can chat regardless of physical distance
- Location data is used for:
  - Displaying distance information in dashboards
  - Backend analytics and insights
  - Admin reference and monitoring
  - Showing "nearby" profiles (informational only)

### Coin System
- Male users must have sufficient coins to send messages (50 coins) or initiate video calls (500 coins)
- Female users message for free
- Female users earn coins when male users interact with them
- Coins can be purchased through various payment methods
- Transaction history tracks all coin movements

### Messaging
- Real-time messaging between users
- Male users pay 50 coins per message
- Female users message for free
- Messages support text and photos
- Read receipts show message status

### Video Calls
- Male users pay 500 coins to initiate video calls
- Female users can receive calls for free
- Video calls require sufficient coin balance
- Call notifications are sent to female users

---

## Summary

MatchMint is a coin-based dating platform where male users purchase coins to interact with female users through messaging and video calls. Female users earn coins from these interactions and can withdraw their earnings. The platform emphasizes online connections rather than physical meetups, with location data used for informational purposes only. The admin panel provides comprehensive management tools for monitoring users, processing withdrawals, and configuring the platform economy.

