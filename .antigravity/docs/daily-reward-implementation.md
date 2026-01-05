# Daily Reward Implementation for Male Dashboard

## Overview
Implemented automatic daily reward claim functionality that awards 20 coins to male users when they access their dashboard, regardless of whether they performed a fresh login operation.

## Changes Made

### Frontend Changes

#### File: `frontend/src/module/male/pages/MaleDashboard.tsx`

**New Imports Added:**
```tsx
import { DailyRewardModal } from '../../../shared/components/DailyRewardModal';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import apiClient from '../../../core/api/client';
```

**New State Variables:**
```tsx
const { updateBalance } = useGlobalState();
const [isDailyRewardModalOpen, setIsDailyRewardModalOpen] = useState(false);
const [dailyRewardData, setDailyRewardData] = useState({ amount: 0, newBalance: 0 });
```

**Daily Reward Claiming Logic:**
Added a `useEffect` hook that runs on component mount to automatically attempt to claim the daily reward:

```tsx
useEffect(() => {
  const checkDailyReward = async () => {
    try {
      console.log('[DailyReward] Attempting to claim on dashboard load...');
      const response = await apiClient.post('/rewards/daily/claim');
      const result = response.data.data;

      if (result.claimed) {
        // Show celebration modal with reward amount
        setDailyRewardData({
          amount: result.amount,
          newBalance: result.newBalance
        });
        setIsDailyRewardModalOpen(true);
        // Update global balance in state
        updateBalance(result.newBalance);
      } else {
        console.log('[DailyReward] Not claimed. Reason:', result.reason);
      }
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.log('[DailyReward] Failed to claim:', error);
    }
  };

  checkDailyReward();
}, [updateBalance]);
```

**UI Component Added:**
```tsx
<DailyRewardModal
  isOpen={isDailyRewardModalOpen}
  onClose={() => setIsDailyRewardModalOpen(false)}
  coinsAwarded={dailyRewardData.amount}
  newBalance={dailyRewardData.newBalance}
/>
```

### Backend (Already Implemented)

#### Files:
- `backend/src/controllers/reward/dailyRewardController.js`
- `backend/src/services/reward/dailyRewardService.js`
- `backend/src/models/User.js` (has `lastDailyRewardDate` field)

**Endpoint:** `POST /api/rewards/daily/claim`

**Service Logic:**
```javascript
const DAILY_REWARD_AMOUNT = 20;

export const claimDailyReward = async (userId) => {
  const user = await User.findById(userId);
  
  // Only male users get daily rewards
  if (user.role !== 'male') {
    return { claimed: false, reason: 'Daily rewards are only for male users' };
  }

  // Check if user already claimed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastRewardDate = user.lastDailyRewardDate ? new Date(user.lastDailyRewardDate) : null;
  
  if (lastRewardDate) {
    lastRewardDate.setHours(0, 0, 0, 0);
    
    // If already claimed today, return without giving reward
    if (lastRewardDate.getTime() === today.getTime()) {
      return { claimed: false, reason: 'Already claimed today' };
    }
  }

  // Award the daily reward
  user.coinBalance += DAILY_REWARD_AMOUNT;
  user.lastDailyRewardDate = new Date();
  await user.save();

  return {
    claimed: true,
    amount: DAILY_REWARD_AMOUNT,
    newBalance: user.coinBalance,
    isFirstClaim: !lastRewardDate
  };
};
```

## How It Works

1. **On Dashboard Access:** When a male user navigates to their dashboard (`/male/dashboard`), the component mounts.

2. **Automatic Claim Attempt:** A `useEffect` hook immediately fires and calls the `/api/rewards/daily/claim` endpoint.

3. **Backend Validation:** The backend checks:
   - Is the user a male? (Only males get daily rewards)
   - Has the user already claimed today? (Compares `lastDailyRewardDate` with current date)

4. **Reward Distribution:**
   - **First time claim or new day:** Award 20 coins, update balance, save `lastDailyRewardDate`
   - **Already claimed today:** Return `claimed: false` with reason

5. **UI Update:**
   - **If claimed:** Show celebration modal with coin amount and new balance
   - **If not claimed:** Silently continue (no modal shown)
   - **On error:** Silently fail to avoid disrupting user experience

6. **Balance Sync:** The global balance state is updated via `updateBalance()` to reflect the new coin count across the app.

## Key Features

✅ **Login-Independent:** Works whether user logged in fresh or is accessing via existing auth token
✅ **Once Per Day:** Prevents multiple claims on the same day using server-side date comparison
✅ **Male Only:** Only male users receive this reward (females have different earning mechanisms)
✅ **Silent Failure:** Network errors don't break the dashboard experience
✅ **Visual Feedback:** Celebration modal shows reward when successfully claimed
✅ **Global State Sync:** Coin balance updates across all components immediately

## Testing Scenarios

1. **First Visit of the Day:**
   - User accesses dashboard
   - Modal appears showing "+20 Coins!"
   - Balance updates in navbar/wallet

2. **Second Visit Same Day:**
   - User accesses dashboard again
   - No modal appears
   - Console shows "Already claimed today"

3. **Next Day Visit:**
   - User accesses dashboard on a fresh day
   - Modal appears again with new reward
   - Balance increases by 20 coins

4. **Token Still Valid:**
   - User didn't perform login (token not expired)
   - Still gets reward on dashboard access
   - Works exactly like fresh login scenario

## Database Schema

The `User` model includes:
```javascript
lastDailyRewardDate: {
  type: Date,
  default: null
}
```

This field tracks the last time a user claimed their daily reward, enabling the once-per-day validation.
