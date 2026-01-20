# Block & Report System Implementation Plan

**Created:** 2026-01-20
**Complexity Level:** HIGH - Multi-layer system touching database, backend, frontend, and real-time communication

## Overview
Implement a comprehensive user blocking and reporting system with:
1. Admin-initiated blocks (temporary/permanent)
2. Report-based automatic blocking (reporter blocks reported user communication)
3. Admin review queue for reported users
4. Communication prevention with proper UI notifications

---

## Phase 1: Database Schema Updates

### 1.1 User Model Additions
**File:** `backend/src/models/User.js`

Add fields to existing User schema:
```javascript
// Blocking relationships
blockedUsers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  index: true
}],
blockedBy: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  index: true
}],

// Admin block information
blockReason: {
  type: String,
  trim: true
},
blockedAt: Date,
blockedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User' // Admin who blocked
}
```

### 1.2 Report Model Updates
**File:** `backend/src/models/Report.js`

Already has `adminAction` field - verify it supports:
- `none` ✓
- `warned` ✓
- `temporarily_blocked` ✓
- `permanently_blocked` ✓

Add auto-block tracking:
```javascript
autoBlocked: {
  type: Boolean,
  default: true // Reporter auto-blocks reported user
}
```

---

## Phase 2: Backend API Development

### 2.1 Admin Block/Unblock Endpoints
**File:** `backend/src/controllers/adminController.js`

**New Functions:**
```javascript
// POST /api/admin/users/:userId/block
exports.blockUser = async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  
  // Set isBlocked = true
  // Set blockReason, blockedAt, blockedBy (admin ID)
  // Emit socket event to disconnect user
  // Return success
};

// POST /api/admin/users/:userId/unblock
exports.unblockUser = async (req, res) => {
  // Set isBlocked = false
  // Clear blockReason, blockedAt, blockedBy
  // Return success
};
```

### 2.2 Report Submission Updates
**File:** `backend/src/controllers/reportController.js`

**Update `submitReport`:**
```javascript
exports.submitReport = async (req, res) => {
  // Create report (existing logic)
  
  // NEW: Auto-block communication
  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { blockedUsers: reportedId }
  });
  
  await User.findByIdAndUpdate(reportedId, {
    $addToSet: { blockedBy: req.user.id }
  });
  
  // Return success
};
```

### 2.3 Report Review Endpoints
**File:** `backend/src/controllers/adminController.js`

```javascript
// GET /api/admin/reports/pending
exports.getPendingReports = async (req, res) => {
  const reports = await Report.find({ status: 'pending' })
    .populate('reporterId reportedId')
    .sort({ createdAt: -1 });
  return res.json(reports);
};

// POST /api/admin/reports/:reportId/review
exports.reviewReport = async (req, res) => {
  const { action } = req.body; // 'dismiss', 'warn', 'block'
  
  // Update report status
  // If action === 'block', call blockUser logic
  // Return success
};
```

### 2.4 Communication Blocking Middleware
**File:** `backend/src/middleware/blockCheck.js` (NEW)

```javascript
export const checkBlockedStatus = async (req, res, next) => {
  const userId = req.user.id;
  const targetUserId = req.body.recipientId || req.params.userId;
  
  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);
  
  // Check if user is blocked by admin
  if (user.isBlocked) {
    return res.status(403).json({
      blocked: true,
      message: 'Your account has been temporarily blocked. Please contact support.'
    });
  }
  
  // Check if users have blocked each other
  if (user.blockedUsers.includes(targetUserId) || 
      user.blockedBy.includes(targetUserId)) {
    return res.status(403).json({
      blocked: true,
      message: 'You cannot communicate with this user.'
    });
  }
  
  next();
};
```

**Apply to routes:**
- `/api/chat/send-message` - Add middleware
- `/api/chat/create` - Add middleware
- `/api/video-call/initiate` - Add middleware

---

## Phase 3: Frontend Admin Panel Updates

### 3.1 Users Management Page Updates
**File:** `frontend/src/module/admin/pages/UsersManagementPage.tsx`

**Changes:**
1. Replace verification filters with block filter
2. Update filter buttons:
   - Remove: "Verified" and "Unverified" buttons
   - Add: "Blocked Users" button
3. Update stats cards (keep "Verified Users" stat, remove filter UI)

### 3.2 User Detail Modal Updates
**File:** `frontend/src/module/admin/components/UserDetailModal.tsx`

**Changes:**
1. Remove "Verify User" button (lines 214-225)
2. Keep Block/Unblock button (already exists)
3. Add block reason input when blocking

### 3.3 Reports Management Page
**File:** `frontend/src/module/admin/pages/ReportsManagementPage.tsx` (Check if exists)

**Create new page:**
- List all pending reports
- Show reporter name, reported user, reason, timestamp
- Actions: "Dismiss", "Warn", "Block User"
- After action, report moves to "reviewed" status

### 3.4 Admin Service Updates
**File:** `frontend/src/core/services/admin.service.ts`

```typescript
blockUser: async (userId: string, reason: string) => {
  return api.post(`/admin/users/${userId}/block`, { reason });
},

unblockUser: async (userId: string) => {
  return api.post(`/admin/users/${userId}/unblock`);
},

getPendingReports: async () => {
  return api.get('/admin/reports/pending');
},

reviewReport: async (reportId: string, action: string) => {
  return api.post(`/admin/reports/${reportId}/review`, { action });
}
```

---

## Phase 4: User-Facing Block Notifications

### 4.1 Chat Service Error Handling
**File:** `frontend/src/core/services/chat.service.ts`

Update `sendMessage` to handle 403 blocked response:
```typescript
try {
  const response = await api.post('/chat/send-message', data);
  return response.data;
} catch (error) {
  if (error.response?.status === 403 && error.response?.data?.blocked) {
    throw new Error(error.response.data.message);
  }
  throw error;
}
```

### 4.2 Chat Window UI Updates
**Files:**
- `frontend/src/module/male/pages/ChatWindowPage.tsx`
- `frontend/src/module/female/pages/ChatWindowPage.tsx`

Add error toast when sending fails:
```typescript
try {
  await sendMessage(content);
} catch (error) {
  if (error.message.includes('cannot communicate')) {
    showToast('error', 'You cannot communicate with this user.');
  }
}
```

### 4.3 Video Call Blocking
**File:** `frontend/src/core/context/VideoCallContextXState.tsx`

Update call initiation to check blocking status first.

---

## Phase 5: Socket.IO Real-Time Handling

### 5.1 Disconnect Blocked Users
**File:** `backend/src/socket/socketHandler.js`

When admin blocks a user:
```javascript
// Emit to user's socket
io.to(user.socketId).emit('account:blocked', {
  reason: user.blockReason
});

// Force disconnect
io.sockets.sockets.get(user.socketId)?.disconnect(true);
```

### 5.2 Frontend Socket Listener
**File:** `frontend/src/core/services/socket.service.ts`

```typescript
socket.on('account:blocked', (data) => {
  alert(`Your account has been blocked. Reason: ${data.reason}`);
  logout(); // Force logout
  navigate('/login');
});
```

---

## Implementation Order

1. **Backend Schema** (User model updates)
2. **Backend APIs** (Block/unblock, report updates)
3. **Middleware** (Block checking)
4. **Admin UI** (Remove verification, add reports page)
5. **User UI** (Error handling and notifications)
6. **Socket Integration** (Real-time blocking)
7. **Testing** (All scenarios)

---

## Testing Checklist

- [ ] Admin can block/unblock user from user detail modal
- [ ] Blocked user cannot send messages
- [ ] Blocked user cannot initiate video calls
- [ ] Reporter automatically blocks reported user
- [ ] Admin sees pending reports
- [ ] Admin can review and take action on reports
- [ ] Blocked users see proper error messages (not console errors)
- [ ] Socket disconnects blocked users immediately
- [ ] Unblocking restores all functionality

---

## Risk Mitigation

1. **Database Migration**: Add fields without breaking existing records (defaults)
2. **Backward Compatibility**: Check blocks before all communication attempts
3. **Performance**: Index new fields (blockedUsers, blockedBy)
4. **User Experience**: Clear, non-technical error messages

---

## Files to Modify

### Backend (8 files)
1. `backend/src/models/User.js` - Schema updates
2. `backend/src/models/Report.js` - Schema updates
3. `backend/src/controllers/adminController.js` - Block APIs
4. `backend/src/controllers/reportController.js` - Auto-block logic
5. `backend/src/middleware/blockCheck.js` - NEW file
6. `backend/src/routes/adminRoutes.js` - New routes
7. `backend/src/routes/chatRoutes.js` - Add middleware
8. `backend/src/socket/socketHandler.js` - Disconnect logic

### Frontend (10 files)
1. `frontend/src/module/admin/pages/UsersManagementPage.tsx` - Remove verification filters
2. `frontend/src/module/admin/components/UserDetailModal.tsx` - Remove verify button
3. `frontend/src/module/admin/pages/ReportsManagementPage.tsx` - NEW page
4. `frontend/src/core/services/admin.service.ts` - New APIs
5. `frontend/src/core/services/chat.service.ts` - Error handling
6. `frontend/src/core/services/socket.service.ts` - Socket listener
7. `frontend/src/module/male/pages/ChatWindowPage.tsx` - Error toasts
8. `frontend/src/module/female/pages/ChatWindowPage.tsx` - Error toasts
9. `frontend/src/module/admin/components/AdminSidebar.tsx` - Add Reports nav
10. `frontend/src/module/admin/hooks/useAdminNavigation.ts` - Add Reports route

**Total: 18 files (8 backend + 10 frontend)**

---

## Next Steps

Given the complexity, I recommend proceeding in phases:
1. Start with admin UI changes (simplest, immediate value)
2. Then backend blocking logic
3. Then communication prevention
4. Finally socket integration

Proceed with Phase 1?
