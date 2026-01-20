# Manual Testing Guide: Authentication & Onboarding

This guide provides `curl` commands to manually test the authentication flows for MatchMint/Toki-app. You can also import these into Postman.

## Prerequisites

1.  **Start the Server**:
    Open a terminal in `Toki-app/backend` and run:
    ```bash
    npm run dev
    ```
    Ensure MongoDB is running and connected (check server logs).

2.  **Base URL**: `http://localhost:5000/api`

---

## Default Test Scenarios

### 1. Register a Male User (Immediate Active Status)

Male users should be active immediately upon registration.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "password": "password123",
    "role": "male",
    "name": "Rohan Sharma",
    "age": 25
  }'
```

**Expected Response (201 Created):**
- `status`: "success"
- `token`: [JWT String]
- `data.user.role`: "male"
- `data.user.isActive`: true (default)

---

### 2. Register a Female User (Pending Verification)

Female users must provide an Aadhaar card URL and should be in `pending` approval status.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543211",
    "password": "password123",
    "role": "female",
    "name": "Priya Singh",
    "age": 22,
    "aadhaarCardUrl": "https://res.cloudinary.com/demo/image/upload/v1/aadhaar_front.jpg"
  }'
```

**Expected Response (201 Created):**
- `status`: "success"
- `data.user.role`: "female"
- `data.user.approvalStatus`: "pending"
- `data.user.isVerified`: false
- `data.user.verificationDocuments.aadhaarCard.url`: [Your URL]

---

### 3. Fail Female Registration (Missing Documents)

Attempting to register a female user without an Aadhaar URL should fail.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543212",
    "password": "password123",
    "role": "female",
    "name": "Missing Doc User",
    "age": 22
  }'
```

**Expected Response (400 Bad Request):**
- `message`: "Aadhaar card document is required for female registration"

---

### 4. Login (Male User)

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "password": "password123"
  }'
```

**Expected Response (200 OK):**
- `status`: "success"
- `token`: [JWT String]

---

### 5. Login (Female User - Pending)

Even if pending, she can login, but protected routes will block her actions (Admin must approve specifically).

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543211",
    "password": "password123"
  }'
```

**Expected Response (200 OK):**
- `status`: "success"
- `data.user.approvalStatus`: "pending"

---

## Admin Approval Simulation (Manual Database Update)

Since the Admin API for approval isn't fully wired yet, simulate approval by updating the database directly if you have Mongo Compass, or use a script.

**To verify the 'Block Pending' behavior:**
Try to access a protected route as the pending female user (if you have implemented `requireApproval` middleware on specific routes).

---
**Note**: Since we are in the early stages, "Cloudinary" interaction is simulated by passing a string URL. In production, the Frontend pre-signs and uploads to Cloudinary first, then sends the URL here.

## Admin Approval Workflows

These steps verify the "Signup -> Pending -> Approved" cycle.

### 6. Login as Admin

First, ensure you have an admin user in the database. If not, create one manually in MongoDB or use a seed script.
*(Assuming admin phone: 1234567890, password: password123)*

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "1234567890",
    "password": "password123"
  }'
```

**Expected Response:**
- `token`: [ADMIN_JWT_TOKEN] (Save this!)

---

### 7. List Pending Female Approvals

**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/females/pending?page=1&limit=10 \
  -H "Authorization: Bearer [ADMIN_JWT_TOKEN]"
```

**Expected Response:**
- List of female users with `approvalStatus: 'pending'`
- Includes the user registered in Step 2.
- Note the `_id` of the pending female user.

---

### 8. Approve Female User

Replace `[FEMALE_USER_ID]` with the ID from Step 7.

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/admin/females/[FEMALE_USER_ID]/approve \
  -H "Authorization: Bearer [ADMIN_JWT_TOKEN]"
```

**Expected Response:**
- `status`: "success"
- `message`: "Female user approved successfully"
- `user.approvalStatus`: "approved"
- `user.isVerified`: true

---

### 9. Reject Female User (Optional Test)

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/admin/females/[FEMALE_USER_ID]/reject \
  -H "Authorization: Bearer [ADMIN_JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Blurry ID card"
  }'
```

**Expected Response:**
- `user.approvalStatus`: "rejected"
- `user.rejectionReason`: "Blurry ID card"

