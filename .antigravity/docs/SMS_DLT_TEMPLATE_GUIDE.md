# SMS India Hub - DLT Template Registration Guide

## 🔴 Issue
SMS still shows "MatchMint" instead of "HETNAZ" because the DLT template is registered with the old name.

## 📋 What is DLT?
DLT (Distributed Ledger Technology) is a regulatory requirement by TRAI (Telecom Regulatory Authority of India) for all commercial SMS in India. Every SMS template must be pre-approved and registered.

## ⚠️ Important
**You CANNOT change the SMS text in code if it doesn't match the registered DLT template.** The telecom operators will block the SMS.

---

## 🛠️ Solution: Register New DLT Template

### Step 1: Login to SMS India Hub
1. Go to: https://cloud.smsindiahub.in/
2. Login with your credentials

### Step 2: Navigate to DLT Section
1. Click on **"DLT"** or **"Templates"** in the menu
2. Click **"Add New Template"**

### Step 3: Fill Template Details

**Template Type:** OTP/Transactional

**Template Content:**
```
Your OTP for HETNAZ registration is {#var#}. Valid for 10 minutes. Do not share with anyone. - HETNAZ
```

**OR (if you want to include powered by):**
```
Welcome to HETNAZ. Your OTP for registration is {#var#}. Valid for 10 minutes.
```

**Variables:** 
- Mark `{#var#}` as variable for OTP

**Category:** Service Explicit

**Template Type:** OTP

### Step 4: Submit for Approval
1. Click **Submit**
2. Wait for approval (usually 24-48 hours)
3. You'll receive an email with the **Template ID**

### Step 5: Update Code
Once approved, update your `.env` file:

```env
SMS_HUB_OTP_TEMPLATE_ID=<your_new_template_id>
```

Then revert the temporary fix in `smsHubService.js` to use the new template.

---

## 🚀 Temporary Fix (Currently Applied)

We've temporarily changed the OTP message to a generic format that should work with most standard OTP templates:

```javascript
const message = `Your OTP for registration is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
```

This removes the platform name entirely to avoid the DLT mismatch.

---

## 📝 Template Registration Checklist

- [ ] Login to SMS India Hub dashboard
- [ ] Navigate to DLT Templates
- [ ] Create new template with "HETNAZ"
- [ ] Submit for approval
- [ ] Wait for approval (24-48 hours)
- [ ] Get new Template ID from email
- [ ] Update `SMS_HUB_OTP_TEMPLATE_ID` in `.env`
- [ ] Update `smsHubService.js` to use new template
- [ ] Test OTP SMS
- [ ] Verify "HETNAZ" appears in SMS

---

## 🔍 How to Check Current Template

1. Login to SMS India Hub
2. Go to **DLT Templates** section
3. Find your current OTP template
4. Check the registered text
5. Note the Template ID

---

## ⚡ Quick Reference

**Current Status:**
- ✅ Code updated to use "HETNAZ"
- ❌ DLT template still has "MatchMint"
- ✅ Temporary generic message applied

**Next Action:**
Register new DLT template with "HETNAZ" in SMS India Hub dashboard.

---

**Contact SMS India Hub Support:**
- Email: support@smsindiahub.in
- Phone: Check their website
- Dashboard: https://cloud.smsindiahub.in/
