# HETNAZ Deployment - Complete SOP (Standard Operating Procedure)

**Created:** January 16, 2026  
**App URL:** https://hetnaz.in  
**API URL:** https://api.hetnaz.in  

---

## 📌 What This Document Covers

This is a step-by-step guide to deploy the HETNAZ application from scratch. It covers:
- Setting up frontend on Vercel
- Setting up backend on Contabo VPS
- Connecting everything together
- Security configurations

---

# PART 1: PREREQUISITES

## What You Need Before Starting

| Item | Where to Get It |
|------|-----------------|
| GitHub account | github.com |
| Vercel account | vercel.com |
| Contabo VPS | contabo.com |
| Domain name | Any registrar (GoDaddy, Namecheap, etc.) |
| MongoDB Atlas account | mongodb.com |

## Our Setup

| Component | Service | URL/IP |
|-----------|---------|--------|
| Frontend | Vercel | hetnaz.in |
| Backend | Contabo VPS | 109.199.110.185 |
| Database | MongoDB Atlas | Cloud hosted |
| Code Repository | GitHub | github.com/harshu-panchal/Hetnaz.git |

---

# PART 2: DOMAIN SETUP

## Step 1: Buy a Domain

We bought: **hetnaz.in**

## Step 2: Connect Domain to Vercel

When you add a domain in Vercel, it gives you **Nameservers**:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

## Step 3: Update Domain Registrar

Go to your domain registrar (where you bought the domain) and:
1. Find "Nameservers" or "DNS Settings"
2. Change nameservers to the Vercel ones above
3. Save changes

**Wait time:** 5 minutes to 24 hours for DNS to propagate

## Step 4: Verify in Vercel

After updating nameservers:
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Settings** → **Domains**
4. You should see ✅ "Valid Configuration"

---

# PART 3: VERCEL FRONTEND SETUP

## Step 1: Connect GitHub to Vercel

1. Go to vercel.com and login
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose your GitHub repo
5. Select the **frontend** folder as root directory
6. Click "Deploy"

## Step 2: Add Domain

1. Go to your project in Vercel
2. Settings → Domains
3. Add: `hetnaz.in`
4. Vercel will show you nameservers (see Part 2)

## Step 3: Add Environment Variables

Go to: **Settings** → **Environment Variables**

Add these 13 variables:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://api.hetnaz.in/api` |
| `VITE_SOCKET_URL` | `https://api.hetnaz.in` |
| `VITE_CLOUDINARY_CLOUD_NAME` | `dwgjfuydo` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `matchmint-unsigned` |
| `VITE_GOOGLE_MAPS_AND_TRANSLATE_API` | `AIzaSyCMqSr_si00hks4ef-eqjQMiMWWvIRXTg8` |
| `VITE_AGORA_APP_ID` | `df4c5962105d46be96c4be86de0990ff` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyDZU9nQpOU6FyurlgqwOxEUmWkflhi6PP8` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `datingapp-f035b.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `datingapp-f035b` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `datingapp-f035b.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `895077165542` |
| `VITE_FIREBASE_APP_ID` | `1:895077165542:web:c88c17e136c93c760d4e27` |
| `VITE_FIREBASE_VAPID_KEY` | `BLaPbRDpPCYh4_kF0Vnwz57k6v1gWZecIKQHTxwW7SeYxGTEzRIGfV8vnlk5w6MTDQua8RGb5SzUPiydayX8mYA` |

## Step 4: Add Backend Subdomain (DNS)

In Vercel, go to your domain's DNS settings and add:
- **Type:** A
- **Name:** api
- **Value:** 109.199.110.185 (your VPS IP)
- **TTL:** 60

This creates: `api.hetnaz.in` → VPS

## Step 5: Redeploy

After adding environment variables:
1. Go to Deployments tab
2. Click ... on latest deployment
3. Click "Redeploy"

---

# PART 4: CONTABO VPS BACKEND SETUP

## Step 1: Get VPS Credentials

From Contabo email after purchase:
- **IP Address:** 109.199.110.185
- **Username:** root
- **Password:** (in email)

## Step 2: Connect via SSH

Open PowerShell on Windows and type:
```
ssh root@109.199.110.185
```

Type `yes` when asked, then enter password.

## Step 3: Update Server

```bash
apt update && apt upgrade -y
```

## Step 4: Install Required Software

```bash
# Install tools
apt install -y curl wget git ufw nano

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (keeps app running)
npm install -g pm2

# Install Nginx (web server)
apt install -y nginx
```

## Step 5: Setup Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 5000
ufw enable
```
Type `y` when asked.

## Step 6: Clone Code from GitHub

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/harshu-panchal/Hetnaz.git hetnaz
cd hetnaz/backend
npm install
npm install firebase-admin
```

## Step 7: Create Environment File

```bash
nano .env
```

Paste this content (already configured for production):

```env
NODE_ENV=production
PORT=5000
SERVER_URL=https://api.hetnaz.in

MONGODB_URI=mongodb+srv://Dating-User:datingUserAssociate@cluster-date.j03pv5w.mongodb.net/?appName=Cluster-Date

JWT_SECRET=my-super-secret-jwt-key-1234567890-ABCDEFGHIJKLMNOP
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_REFRESH_EXPIRES_IN=30d

RAZORPAY_KEY_ID=rzp_test_8sYbzHWidwe5Zw
RAZORPAY_KEY_SECRET=GkxKRQ2B0U63BKBoayuugS3D

FRONTEND_URL=https://hetnaz.in
SOCKET_CORS_ORIGIN=https://hetnaz.in

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info

VIDEO_CALL_PRICE=500
VIDEO_CALL_DURATION_SECONDS=300

STUN_URL=stun:stun.l.google.com:19302
TURN_URIS=turn:openrelay.metered.ca:80,turn:openrelay.metered.ca:443
TURN_USER=openrelay
TURN_PASS=openrelay
CALL_CONNECTION_TIMEOUT_SECONDS=20
MAX_CONCURRENT_CALLS_PER_USER=1

AGORA_APP_ID=df4c5962105d46be96c4be86de0990ff
AGORA_APP_CERTIFICATE=96b9aca042cf44b6a42626c23d3c55db

CLOUDINARY_CLOUD_NAME=dwgjfuydo
CLOUDINARY_API_KEY=147552829585318
CLOUDINARY_API_SECRET=ThC3ZB8uI21A6W7lrAVAtpHQYl0

SMS_HUB_API_KEY=SG8WYP6bXEuFxRYacm0w2A
SMS_HUB_SENDER_ID=SMSHUB
SMS_HUB_ENTITY_ID=1701158019630577568
SMS_HUB_OTP_TEMPLATE_ID=1007801291964877107

FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/firebase-service-account.json
```

Save: `Ctrl+X`, then `Y`, then `Enter`

## Step 8: Upload Firebase File

From a NEW PowerShell window on your Windows PC:

```powershell
cd "C:\Users\HP\OneDrive\Desktop\HETNAZ\HETNAZ\backend\src\config"
scp "datingapp-f035b-firebase-adminsdk-fbsvc-765ff04cf4.json" root@109.199.110.185:/var/www/hetnaz/backend/src/config/firebase-service-account.json
```

## Step 9: Start Backend with PM2

```bash
cd /var/www/hetnaz/backend
pm2 start src/server.js --name "hetnaz-backend"
pm2 save
pm2 startup
```

## Step 10: Configure Nginx

```bash
nano /etc/nginx/sites-available/hetnaz-api
```

Paste:
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

Save and enable:
```bash
ln -s /etc/nginx/sites-available/hetnaz-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Step 11: Get SSL Certificate (HTTPS)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.hetnaz.in
```

Follow prompts:
- Enter email
- Agree to terms (Y)
- Share email (N)

---

# PART 5: SECURITY CONFIGURATION

## MongoDB IP Whitelisting

1. Go to cloud.mongodb.com
2. Network Access (left sidebar)
3. Delete `0.0.0.0/0` entry if exists
4. Add: `109.199.110.185` with comment "Contabo VPS"

---

# PART 6: USEFUL COMMANDS

## SSH into Server
```bash
ssh root@109.199.110.185
```

## View Logs
```bash
pm2 logs hetnaz-backend
```

## Restart Backend
```bash
pm2 restart hetnaz-backend
```

## Check Status
```bash
pm2 status
```

## Update Code from GitHub
```bash
cd /var/www/hetnaz
git pull
cd backend
npm install
pm2 restart hetnaz-backend
```

---

# PART 7: TROUBLESHOOTING

## App not loading?
1. Check PM2: `pm2 status`
2. Check logs: `pm2 logs hetnaz-backend --lines 50`
3. Restart if needed: `pm2 restart hetnaz-backend`

## SSL issues?
```bash
certbot renew --dry-run
```

## Nginx errors?
```bash
nginx -t
cat /var/log/nginx/error.log
```

## MongoDB connection failed?
- Check if VPS IP is whitelisted in MongoDB Atlas
- Verify MONGODB_URI in .env file

---

# PART 8: ARCHITECTURE DIAGRAM

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    User's       │────▶│    Vercel       │     │   MongoDB       │
│    Browser      │     │   (Frontend)    │     │    Atlas        │
│                 │     │   hetnaz.in     │     │                 │
└─────────────────┘     └────────┬────────┘     └────────▲────────┘
                                 │                       │
                                 │ API Calls             │
                                 ▼                       │
                        ┌─────────────────┐              │
                        │                 │              │
                        │  Contabo VPS    │──────────────┘
                        │  (Backend)      │
                        │ api.hetnaz.in   │
                        │                 │
                        └─────────────────┘
```

---

# PART 9: CONTACT & SUPPORT

| Service | Support |
|---------|---------|
| Vercel | vercel.com/support |
| Contabo | support@contabo.com |
| MongoDB | mongodb.com/support |
| Domain | Your registrar's support |

---

**End of SOP**

*Last updated: January 16, 2026*
