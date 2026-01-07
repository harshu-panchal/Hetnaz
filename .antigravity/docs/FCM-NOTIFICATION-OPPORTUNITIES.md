# 📱 Push Notification Opportunities Analysis - Toki App

## 🎯 **Priority Classification**
- 🔥 **P0 (Critical):** User expects immediate notification
- ⭐ **P1 (High):** Significantly improves engagement
- 📌 **P2 (Medium):** Nice to have, improves UX
- 💡 **P3 (Low):** Optional, future consideration

---

## 👨 **MALE USER NOTIFICATIONS**

### **🔥 P0 - Critical (Must Have)**

1. **New Message from Female** 🔥
   - **Trigger:** Female sends text/image/gift message
   - **Location:** `messageController.js` - Lines 148-221
   - **Notification:** "💬 Sarah sent you a message"
   - **Action:** Open chat with female
   - **Status:** ❌ Not Implemented

2. **Video Call Request** 🔥
   - **Trigger:** Female initiates video call
   - **Location:** Video call service
   - **Notification:** "📹 Sarah is calling you"
   - **Action:** Open video call screen
   - **Status:** ❓ Need to check

### **⭐ P1 - High Priority**

3. **Female Accepted Chat Request** ⭐
   - **Trigger:** Female responds to first "Hi" message
   - **Location:** Message controller (first female reply)
   - **Notification:** "✅ Sarah accepted your chat!"
   - **Action:** Open chat

4. **New Nearby Female** ⭐
   - **Trigger:** New female user within 50km
   - **Location:** Discovery service
   - **Notification:** "💃 New girl nearby: Sarah, 23"
   - **Action:** Open discovery/nearby page

5. **Low Coin Balance Warning** ⭐
   - **Trigger:** Balance < 50 coins
   - **Location:** After message/gift send
   - **Notification:** "⚠️ Low balance: 20 coins left"
   - **Action:** Go to coin purchase page

### **📌 P2 - Medium Priority**

6. **Daily Reward Available** 📌
   - **Trigger:** 24 hours since last claim
   - **Location:** Reward service
   - **Notification:** "🎁 Your daily coins are ready!"
   - **Action:** Open dashboard to claim

7. **Intimacy Level Up** 📌
   - **Trigger:** Chat reaches new intimacy level
   - **Location:** `messageController.js` - Lines 184-194
   - **Notification:** "🎉 Level up! You're now Friends with Sarah"
   - **Action:** Open chat

8. **Special Offers/Promotions** 📌
   - **Trigger:** Admin creates offer
   - **Location:** Admin panel
   - **Notification:** "💎 50% off on coin packs!"
   - **Action:** Coin purchase page

### **💡 P3 - Low Priority**

9. **Profile Views** 💡
   - **Trigger:** Female views male profile
   - **Notification:** "👀 Sarah viewed your profile"
   - **Action:** Open profile

10. **Badge Unlocked** 💡
    - **Trigger:** Male achieves milestone
    - **Notification:** "🏆 Badge unlocked: Social Butterfly"
    - **Action:** Open badges page

---

## 👩 **FEMALE USER NOTIFICATIONS**

### **🔥 P0 - Critical (Must Have)**

1. **New Message from Male** 🔥
   - **Trigger:** Male sends text/image/gift message
   - **Location:** `messageController.js` - Lines 148-221
   - **Notification:** "💬 John sent you a message"
   - **Action:** Open chat with male
   - **Status:** ❌ Not Implemented

2. **Video Call Request** 🔥
   - **Trigger:** Male initiates video call
   - **Location:** Video call service
   - **Notification:** "📹 John is calling you"
   - **Action:** Open video call screen
   - **Status:** ❓ Need to check

3. **Gift Received** 🔥
   - **Trigger:** Male sends gift
   - **Location:** `messageController.js` - Line 508-577
   - **Notification:** "🎁 John sent you a Rose! +50 coins"
   - **Action:** Open chat
   - **Status:** ❌ Not Implemented

### **⭐ P1 - High Priority**

4. **Earnings Milestone** ⭐
   - **Trigger:** Earnings reach 1000, 5000, 10K coins
   - **Location:** Transaction completion
   - **Notification:** "🎉 You've earned 1000 coins!"
   - **Action:** Open earnings page

5. **Withdrawal Approved** ⭐
   - **Trigger:** Admin approves withdrawal
   - **Location:** Admin panel
   - **Notification:** "✅ Your withdrawal of ₹500 is approved!"
   - **Action:** Open withdrawal history

6. **Withdrawal Rejected** ⭐
   - **Trigger:** Admin rejects withdrawal
   - **Location:** Admin panel
   - **Notification:** "❌ Withdrawal rejected: [reason]"
   - **Action:** Open withdrawal page

7. **New Chat Request (Hi Message)** ⭐
   - **Trigger:** Male sends "Hi" message
   - **Location:** `messageController.js` - sendHiMessage
   - **Notification:** "👋 John wants to chat!"
   - **Action:** Chat list or specific chat

### **📌 P2 - Medium Priority**

8. **Pending Messages Reminder** 📌
   - **Trigger:** Unread messages > 5, no activity for 1 hour
   - **Notification:** "💬 You have 5 unread messages"
   - **Action:** Chat list

9. **Auto-Message Performance** 📌
   - **Trigger:** Daily summary of auto-messages sent
   - **Notification:** "📊 Your auto-messages sent 50 messages today!"
   - **Action:** Auto-message templates

10. **Profile Approval Status** 📌
    - **Trigger:** Admin approves/rejects profile
    - **Notification:** "✅ Your profile is approved!"
    - **Action:** Dashboard

### **💡 P3 - Low Priority**

11. **Inactive User Reminder** 💡
    - **Trigger:** No activity for 7 days
    - **Notification:** "💕 Your admirers miss you!"
    - **Action:** Dashboard

12. **Tips for Earning** 💡
    - **Trigger:** Low engagement
    - **Notification:** "💡 Tip: Reply faster to earn more!"
    - **Action:** Earnings page

---

## 📊 **Implementation Priority Matrix**

| Notification Type | Male | Female | Priority | Complexity | Impact |
|-------------------|------|--------|----------|------------|--------|
| **New Message** | ✅ | ✅ | 🔥 P0 | Low | Very High |
| **Gift Received** | ❌ | ✅ | 🔥 P0 | Low | Very High |
| **Video Call** | ✅ | ✅ | 🔥 P0 | Medium | Very High |
| **Withdrawal Status** | ❌ | ✅ | ⭐ P1 | Low | High |
| **Low Balance** | ✅ | ❌ | ⭐ P1 | Low | High |
| **Chat Accepted** | ✅ | ❌ | ⭐ P1 | Medium | Medium |
| **Daily Reward** | ✅ | ❌ | 📌 P2 | Low | Medium |
| **Level Up** | ✅ | ✅ | 📌 P2 | Low | Medium |
| **Earnings Milestone** | ❌ | ✅ | ⭐ P1 | Low | Medium |

---

## 🚀 **PHASE 1 Implementation Plan (Now)**

### **1. Chat Notifications (Both Users)** 🔥
**Files to modify:**
- `backend/src/controllers/chat/messageController.js`
- Add FCM calls after message creation

**Notification Types:**
- ✅ Text message: "💬 [Name] sent you a message"
- ✅ Image message: "📸 [Name] sent you a photo"
- ✅ Gift message: "🎁 [Name] sent you [gift name]"

**Implementation:**
```javascript
// After line 221 in sendMessage()
await sendNotificationToReceiver(receiverId, {
  title: `${sender.profile.name} sent a message`,
  body: messageType === 'image' ? '📸 Photo' : content,
  data: { chatId, messageId, type: 'new_message' }
});
```

### **2. Video Call Notifications** 🔥
- Trigger when call is initiated
- "📹 [Name] is calling you"

---

## 📋 **PHASE 2 Implementation (Next)**

### **3. Female-Specific**
- Withdrawal status updates
- Earnings milestones

### **4. Male-Specific**
- Low balance warnings
- New nearby females
- Chat acceptance

---

## 🔧 **Technical Implementation Notes**

### **Message Notifications Location:**
```
File: backend/src/controllers/chat/messageController.js
Functions to modify:
- sendMessage() - Line 46-235
- sendHiMessage() - Line 240-406
- sendGift() - Line 411-592
```

### **Notification Content Examples:**

#### **Male Receives:**
```javascript
{
  title: "Sarah sent you a message",
  body: "Hey! How are you doing?",
  data: {
    type: "new_message",
    chatId: "...",
    senderId: "...",
    senderName: "Sarah",
    messageType: "text"
  }
}
```

#### **Female Receives:**
```javascript
{
  title: "John sent you a gift",
  body: "🎁 Rose (+50 coins)",
  data: {
    type: "gift_received",
    chatId: "...",
    senderId: "...",
    senderName: "John",
    giftName: "Rose",
    coinsEarned: 50
  }
}
```

---

## 📊 **Estimated Timeline**

| Phase | Features | Estimated Time |
|-------|----------|----------------|
| **Phase 1** | Chat notifications (text, image, gift) | 1-2 hours |
| **Phase 2** | Video call notifications | 1 hour |
| **Phase 3** | Withdrawal & earnings | 1 hour |
| **Phase 4** | All remaining | 2-3 hours |

**Total:** ~5-7 hours for complete implementation

---

## ✅ **Implementation Checklist**

**Immediate (Phase 1):**
- [ ] Text message notifications
- [ ] Image message notifications
- [ ] Gift message notifications
- [ ] Handle offline users
- [ ] Auto-cleanup invalid tokens

**Next (Phase 2):**
- [ ] Video call notifications
- [ ] Withdrawal status notifications
- [ ] Low balance warnings

**Future:**
- [ ] Scheduled notifications (daily rewards)
- [ ] Promotional notifications
- [ ] Engagement reminders

---

**Starting with Phase 1: Chat Notifications (Text, Image, Gift)**

This will provide immediate value to both male and female users! 🚀
