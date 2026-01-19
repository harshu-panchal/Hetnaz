---
description: Complete guide to deploy HETNAZ backend on Contabo VPS
---

# HETNAZ Backend Deployment on Contabo VPS

## Prerequisites
- **VPS IP**: 109.199.110.185
- **Domain**: hetnaz.in (frontend on Vercel)
- **Backend Domain**: api.hetnaz.in (we will set this up)
- **GitHub Repo**: https://github.com/harshu-panchal/Hetnaz.git

---

## PHASE 1: Connect to Your VPS

### Step 1.1: Get SSH Credentials from Contabo
1. Log into your Contabo Control Panel
2. Find your VPS and note down:
   - **IP Address**: 109.199.110.185
   - **Root Password**: (was emailed to you when VPS was created)

### Step 1.2: Install SSH Client (if needed)
Windows 10/11 has built-in SSH. Open PowerShell and run:
```powershell
ssh root@109.199.110.185
```

When prompted:
- Type `yes` if asked about fingerprint
- Enter your root password from Contabo email

**Success looks like**: You see a Linux terminal prompt like `root@vps:~#`

---

## PHASE 2: Initial Server Setup

Once connected via SSH, run these commands one by one:

### Step 2.1: Update System
```bash
apt update && apt upgrade -y
```

### Step 2.2: Install Essential Tools
```bash
apt install -y curl wget git ufw nano
```

### Step 2.3: Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Verify installation:
```bash
node --version
npm --version
```

### Step 2.4: Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### Step 2.5: Install Nginx (Web Server/Reverse Proxy)
```bash
apt install -y nginx
```

### Step 2.6: Configure Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 5000
ufw enable
```
Type `y` when prompted.

---

## PHASE 3: Clone and Setup Backend

### Step 3.1: Create App Directory
```bash
mkdir -p /var/www
cd /var/www
```

### Step 3.2: Clone Repository
```bash
git clone https://github.com/harshu-panchal/Hetnaz.git hetnaz
cd hetnaz/backend
```

### Step 3.3: Install Dependencies
```bash
npm install
```

---

## PHASE 4: Setup Environment Variables

### Step 4.1: Create .env File
```bash
nano .env
```

### Step 4.2: Paste This Content (EDIT VALUES AS NEEDED)
```env
# ============================================
# Server Configuration
# ============================================
NODE_ENV=production
PORT=5000
SERVER_URL=https://api.hetnaz.in

# ============================================
# MongoDB Configuration
# ============================================
MONGODB_URI=mongodb+srv://Dating-User:datingUserAssociate@cluster-date.j03pv5w.mongodb.net/?appName=Cluster-Date

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET=my-super-secret-jwt-key-1234567890-ABCDEFGHIJKLMNOP
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# Razorpay Configuration
# ============================================
RAZORPAY_KEY_ID=rzp_test_8sYbzHWidwe5Zw
RAZORPAY_KEY_SECRET=GkxKRQ2B0U63BKBoayuugS3D

# ============================================
# Frontend Configuration
# ============================================
FRONTEND_URL=https://hetnaz.in

# ============================================
# Socket.IO Configuration
# ============================================
SOCKET_CORS_ORIGIN=https://hetnaz.in

# ============================================
# File Upload Configuration
# ============================================
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# ============================================
# Rate Limiting Configuration
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# Logging Configuration
# ============================================
LOG_LEVEL=info

# ============================================
# VIDEO CALL CONFIG
# ============================================
VIDEO_CALL_PRICE=500
VIDEO_CALL_DURATION_SECONDS=300

# ============================================
# WEBRTC (Agora)
# ============================================
STUN_URL=stun:stun.l.google.com:19302
TURN_URIS=turn:openrelay.metered.ca:80,turn:openrelay.metered.ca:443
TURN_USER=openrelay
TURN_PASS=openrelay
CALL_CONNECTION_TIMEOUT_SECONDS=20
MAX_CONCURRENT_CALLS_PER_USER=1

AGORA_APP_ID=df4c5962105d46be96c4be86de0990ff
AGORA_APP_CERTIFICATE=96b9aca042cf44b6a42626c23d3c55db

# ============================================
# Cloudinary
# ============================================
CLOUDINARY_CLOUD_NAME=dwgjfuydo
CLOUDINARY_API_KEY=147552829585318
CLOUDINARY_API_SECRET=ThC3ZB8uI21A6W7lrAVAtpHQYl0

# ============================================
# SMS Hub
# ============================================
SMS_HUB_API_KEY=SG8WYP6bXEuFxRYacm0w2A
SMS_HUB_SENDER_ID=SMSHUB
SMS_HUB_ENTITY_ID=1701158019630577568
SMS_HUB_OTP_TEMPLATE_ID=1007801291964877107

# ============================================
# Firebase
# ============================================
FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/firebase-service-account.json
```

### Step 4.3: Save and Exit
Press `Ctrl+X`, then `Y`, then `Enter`

---

## PHASE 5: Upload Firebase Service Account File

This is the sensitive file that's not on GitHub. You need to upload it from your Windows PC.

### Step 5.1: Open NEW PowerShell on Your Windows PC (Don't close the SSH session)
```powershell
cd "C:\Users\HP\OneDrive\Desktop\HETNAZ\HETNAZ\backend\src\config"
```

### Step 5.2: Upload the Firebase File Using SCP
```powershell
scp "datingapp-f035b-firebase-adminsdk-fbsvc-765ff04cf4.json" root@109.199.110.185:/var/www/hetnaz/backend/src/config/firebase-service-account.json
```
Enter your root password when prompted.

### Step 5.3: Verify on VPS (go back to SSH session)
```bash
ls -la /var/www/hetnaz/backend/src/config/
```
You should see `firebase-service-account.json`

---

## PHASE 6: Test Backend Locally on VPS

### Step 6.1: Start Backend Manually
```bash
cd /var/www/hetnaz/backend
npm start
```

### Step 6.2: Test in Browser
Open: `http://109.199.110.185:5000/api/health`

You should see a JSON response. If it works, press `Ctrl+C` to stop.

---

## PHASE 7: Setup PM2 for Production

### Step 7.1: Start with PM2
```bash
cd /var/www/hetnaz/backend
pm2 start src/server.js --name "hetnaz-backend"
```

### Step 7.2: Save PM2 Configuration
```bash
pm2 save
pm2 startup
```
Copy and run the command it outputs.

### Step 7.3: Verify PM2
```bash
pm2 status
```
Should show `hetnaz-backend` as `online`.

---

## PHASE 8: Setup Domain DNS

### Step 8.1: Add DNS Record
Go to your domain registrar (where you bought hetnaz.in) and add:
- **Type**: A Record
- **Name**: api
- **Value**: 109.199.110.185
- **TTL**: 3600 (or Auto)

This creates `api.hetnaz.in` pointing to your VPS.

**Wait 5-30 minutes for DNS propagation.**

---

## PHASE 9: Setup Nginx Reverse Proxy

### Step 9.1: Create Nginx Config
```bash
nano /etc/nginx/sites-available/hetnaz-api
```

### Step 9.2: Paste This Configuration
```nginx
server {
    listen 80;
    server_name api.hetnaz.in;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

### Step 9.3: Save and Exit
Press `Ctrl+X`, then `Y`, then `Enter`

### Step 9.4: Enable the Site
```bash
ln -s /etc/nginx/sites-available/hetnaz-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## PHASE 10: Setup SSL (HTTPS)

### Step 10.1: Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### Step 10.2: Get SSL Certificate
```bash
certbot --nginx -d api.hetnaz.in
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

### Step 10.3: Verify SSL
Open in browser: `https://api.hetnaz.in/api/health`

---

## PHASE 11: Update Vercel Environment Variables

Go to your Vercel Dashboard and update these:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://api.hetnaz.in/api` |
| `VITE_SOCKET_URL` | `https://api.hetnaz.in` |

**Redeploy your Vercel project after updating.**

---

## PHASE 12: Useful Commands

### View Backend Logs
```bash
pm2 logs hetnaz-backend
```

### Restart Backend
```bash
pm2 restart hetnaz-backend
```

### Update Code from GitHub
```bash
cd /var/www/hetnaz
git pull origin main
cd backend
npm install
pm2 restart hetnaz-backend
```

### Check Server Status
```bash
pm2 status
systemctl status nginx
```

---

## TROUBLESHOOTING

### Backend not starting?
```bash
cd /var/www/hetnaz/backend
pm2 logs hetnaz-backend --lines 50
```

### Port 5000 already in use?
```bash
lsof -i :5000
kill -9 <PID>
pm2 restart hetnaz-backend
```

### Nginx errors?
```bash
nginx -t
cat /var/log/nginx/error.log
```

### SSL certificate issues?
```bash
certbot renew --dry-run
```

---

## SECURITY CHECKLIST (After Deployment)

- [ ] Change default root password: `passwd`
- [ ] Create non-root user for daily use
- [ ] Update JWT secrets to strong random values
- [ ] Switch Razorpay to live keys when ready
- [ ] Enable MongoDB IP whitelisting for VPS IP only
