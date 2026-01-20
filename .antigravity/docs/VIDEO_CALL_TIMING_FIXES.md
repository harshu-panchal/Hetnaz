# Video Call Timing Issues - Diagnosis & Fixes

**Date**: 2025-12-31  
**Status**: FIXED - Critical Backend Error Resolved

---

## Critical Issues Identified

### 1. **User Model Not Imported** (Root Cause)
**Error**: `User is not defined`  
**Location**: `backend/src/socket/videoCallHandlers.js`  
**Impact**: CASCADE FAILURE - caused all subsequent errors

When `call:end` was triggered, the handler tried to execute:
```javascript
await User.updateMany({ ... }, { $set: { isOnCall: false } });
```

But `User` was never imported, causing:
- Backend crash during soft-end processing
- `call:error` emission to frontend
- Frontend triggering hard cleanup
- Duplicate/ghost events from failed state transitions

**Fix Applied**: ✅ Added `import User from '../models/User.js';`

---

### 2. **Cascade of Duplicate Events**
**Observed**:
```
call:ended (receiver_ended, canRejoin: false) - received TWICE
call:force-end (timer_expired) - for OLD call ID 6954f7ab...
```

**Root Causes**:
- After User error, backend emitted both `call:error` AND `call:ended`
- Frontend cleanup triggered multiple times
- Old call timers not properly cleared

**Fixes Applied**:
✅ Wrapped all `User.updateMany()` calls in try-catch  
✅ Added `validateCallOwnership()` to reject events for old calls  
✅ Prevented duplicate emissions for already-ended calls  
✅ Added proper timer cleanup in hard-end path

---

### 3. **Timing & State Synchronization**
**Issue**: Call appeared to "auto-close" immediately after rejoin screen

**Root Cause**: The error during soft-end caused:
1. Frontend received `call:error`
2. Frontend ran `handleCallError()` → hard cleanup
3. Backend (recovering from error) sent `call:ended` 
4. Frontend processed it again → cleanup AGAIN
5. Old timer fired → `call:force-end` → cleanup AGAIN

**Fixes Applied**:
✅ Error handling prevents cascading failures  
✅ Validation rejects events for calls user doesn't own  
✅ Already-ended calls silently ignored (no duplicate emissions)

---

## Changes Made

### Backend: `videoCallHandlers.js`

#### 1. **Import User Model**
```javascript
import User from '../models/User.js';
```

#### 2. **Add Validation Helper**
```javascript
const validateCallOwnership = async (callId) => {
    const call = await videoCallService.getCall(callId);
    if (!call) return null;
    const isParticipant = call.callerId.toString() === userId || 
                         call.receiverId.toString() === userId;
    return isParticipant ? call : null;
};
```

#### 3. **Wrap User Operations in Try-Catch**
Locations:
- `call:end` handler (soft-end path)
- `disconnect` handler (interruption path)
- `call:rejoin` handler (resume path)

Example:
```javascript
try {
    await User.updateMany(
        { _id: { $in: [call.callerId, call.receiverId] } },
        { $set: { isOnCall: false } }
    );
} catch (dbError) {
    logger.error(`DB update error: ${dbError.message}`);
    // Continue with notification even if DB fails
}
```

#### 4. **Prevent Duplicate Events**
```javascript
if (call.status === 'ended' || call.status === 'cancelled') {
    logger.warn(`Ignoring end request for already ended call`);
    return; // Silent ignore instead of emitting again
}
```

#### 5. **Validate Call Ownership**
```javascript
const call = await validateCallOwnership(callId);
if (!call) {
    socket.emit('call:error', { message: 'Call not found' });
    return;
}
```

---

## Expected Behavior (After Fixes)

### ✅ Normal Call Flow
1. Call connects → Both users see each other
2. User clicks "End" → Backend processes soft-end
3. If >10s remaining → `call:ended` with `canRejoin: true`
4. Frontend shows "Rejoin" popup
5. Other user sees "Waiting for partner"
6. User can click "Rejoin" OR "End Permanently"

### ✅ Error Handling
1. If DB operation fails → Logs error but continues
2. Invalid/old call IDs → Silently ignored
3. Already-ended calls → No duplicate events
4. User not participant → Error returned, no crash

### ✅ Timer Management
1. Soft-end → Clears main timer, starts interruption timer
2. Rejoin → Clears interruption timer, restarts main timer
3. Hard-end → Clears ALL timers for that call
4. Old call timers → Validated before execution

---

## Testing Checklist

- [ ] Start call between User A and B
- [ ] Verify both users connect to Agora successfully
- [ ] User A clicks "End" with >10s remaining
- [ ] Verify User A sees "Rejoin" popup
- [ ] Verify User B sees "Waiting for partner"
- [ ] Wait 5 seconds, click "Rejoin"
- [ ] Verify call resumes successfully
- [ ] End call permanently
- [ ] Verify clean transition to idle state
- [ ] No ghost/duplicate events in console
- [ ] No "User is not defined" errors

---

## Deployment Notes

**Files Changed**:
- `backend/src/socket/videoCallHandlers.js`

**No Database Migrations Needed**

**Backwards Compatible**: Yes

---

## Monitoring

Watch for these in production logs:
- ✅ `DB update error` - Should be rare, logged but not fatal
- ✅ `User ${userId} is not a participant` - Indicates stale event
- ✅ `Ignoring end request for already ended call` - Normal after fixes
- ❌ `User is not defined` - Should NEVER appear now

---

**Status**: Ready for Testing  
**Next Steps**: Deploy to staging → Test flows → Deploy to production
