# Native System Permission Implementation

## Overview
Refactored the permission system to trigger **native system permission dialogs** directly instead of showing a custom modal. This provides a native Android/browser experience.

## Key Changes

### 1. Enhanced `usePermissions` Hook
**Location**: `frontend/src/core/hooks/usePermissions.ts`

**New Features**:
- **LocalStorage Persistence**: Stores permission states (`granted`, `denied`, `prompt`) in localStorage
- **State Tracking**: Tracks camera, microphone, and location permissions separately
- **System Prompt Triggering**: Directly triggers browser/system permission dialogs
- **hasRequestedPermissions()**: Checks if permissions have been requested before

**Storage Keys**:
```typescript
- matchmint_camera_permission
- matchmint_microphone_permission  
- matchmint_location_permission
- matchmint_permissions_requested
```

### 2. Dashboard Auto-Request (First App Open)
**Modified Files**:
- `frontend/src/module/male/pages/MaleDashboard.tsx`
- `frontend/src/module/female/pages/FemaleDashboard.tsx`

**Behavior**:
1. On first app open, checks `hasRequestedPermissions()`
2. If `false`, waits 500ms for UI to settle
3. Triggers `requestAllPermissions()` which shows:
   - **Location permission dialog** (system native)
   - 300ms delay
   - **Camera + Microphone permission dialog** (system native)
4. Stores results in localStorage
5. Never shows again (unless localStorage is cleared)

**Removed**:
- Custom `PermissionRequestModal` component (no longer used)
- Modal state management from dashboards

### 3. Video Call Permission Check
**File**: `frontend/src/shared/components/VideoCallModal.tsx`

**Behavior** (Already Implemented):
- When user clicks "Accept" on incoming call
- Triggers `handleAcceptCall()` which:
  1. Calls `navigator.mediaDevices.getUserMedia()` - **triggers system prompt**
  2. If granted → connects call immediately
  3. If denied → shows inline error message
  4. User can retry after granting in browser settings

**Edge Cases Handled**:
- Permission denied → Clear error message displayed
- No camera/microphone found → Specific error message
- Generic access failure → Fallback error message
- Loading state while checking permissions

## Permission Flow

### First App Open
```
User opens app (Dashboard loads)
    ↓
Check hasRequestedPermissions()
    ↓
If FALSE:
    ↓
Wait 500ms (UI settles)
    ↓
Trigger SYSTEM Location Dialog
    ↓
User grants/denies
    ↓
Wait 300ms
    ↓
Trigger SYSTEM Camera+Mic Dialog
    ↓
User grants/denies
    ↓
Save states to localStorage
    ↓
Set matchmint_permissions_requested = true
```

### Video Call (If Permissions Denied Earlier)
```
Incoming call rings
    ↓
User clicks "Accept"
    ↓
Trigger getUserMedia() → SYSTEM Dialog
    ↓
If GRANTED:
    ↓
    Connect call immediately
    ↓
If DENIED:
    ↓
    Show error: "Camera and microphone access required..."
    ↓
    User can grant in settings and retry
```

## Android Behavior

### WebView/PWA
- System permission dialogs will be native Android dialogs
- Permissions persist across app sessions
- User can manage in Android Settings → App Permissions

### Permission States
- **Always**: Stored as `granted` in localStorage
- **Only this time**: Stored as `granted` but may need re-request on next session
- **Never**: Stored as `denied` - will show error on video call attempts

## Edge Cases Handled

1. **User denies all permissions on first open**
   - App still works (no blocking)
   - Location features disabled
   - Video calls show error when attempted

2. **User denies only camera/mic**
   - Location features work
   - Video calls show error when attempted
   - Can retry after granting in settings

3. **User denies only location**
   - Video calls work
   - Distance/nearby features show "Location not set"

4. **Browser doesn't support permission API**
   - Fallback to localStorage states
   - Prompts still trigger via getUserMedia/getCurrentPosition

5. **User clears localStorage**
   - Permissions re-requested on next app open
   - Previous browser-level permissions still respected

6. **User revokes permissions in browser settings**
   - Next getUserMedia/getCurrentPosition call will fail
   - Error messages guide user to re-enable

## Testing Checklist

- [ ] First app open shows system location dialog
- [ ] After location, shows system camera+mic dialog
- [ ] Granting all permissions works
- [ ] Denying all permissions doesn't break app
- [ ] Permissions don't re-prompt on subsequent visits
- [ ] Video call triggers permission if previously denied
- [ ] Video call connects if permissions granted
- [ ] Error messages display correctly
- [ ] localStorage persists permission states
- [ ] Clearing localStorage resets flow
- [ ] Android WebView shows native dialogs
- [ ] PWA shows native dialogs

## Files Modified

1. `frontend/src/core/hooks/usePermissions.ts` - Enhanced with localStorage
2. `frontend/src/module/male/pages/MaleDashboard.tsx` - Direct system prompts
3. `frontend/src/module/female/pages/FemaleDashboard.tsx` - Direct system prompts
4. `frontend/src/shared/components/VideoCallModal.tsx` - Already has system prompts

## Files Removed/Deprecated

1. `frontend/src/shared/components/PermissionRequestModal.tsx` - No longer used (can be deleted)

## Browser Compatibility

**Fully Supported**:
- Chrome/Edge 90+ (Android & Desktop)
- Firefox 90+
- Safari 14+ (iOS & macOS)
- Samsung Internet 14+

**Fallback Behavior**:
- Older browsers: Prompts still work via getUserMedia/getCurrentPosition
- Permission query API not available: Uses localStorage states only
