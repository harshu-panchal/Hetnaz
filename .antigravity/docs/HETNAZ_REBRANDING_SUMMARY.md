# HETNAZ Rebranding Summary

## Application Name Change: MatchMint → HETNAZ

This document summarizes all changes made to rebrand the application from "MatchMint" / "Toki" to "HETNAZ".

---

## ✅ Frontend Changes

### 1. **Public Assets & Metadata**
- `frontend/public/manifest.json` - Updated app name and short_name to "HETNAZ"
- `frontend/index.html` - Updated title and meta description to "HETNAZ - Dating App"

### 2. **Package Configuration**
- `frontend/package.json` - Changed package name from `matchmint-dating-frontend` to `hetnaz-dating-frontend`

### 3. **Service Worker**
- `frontend/public/sw.js` - Updated all cache names:
  - `matchmint-static` → `hetnaz-static`
  - `matchmint-dynamic` → `hetnaz-dynamic`
  - `matchmint-api` → `hetnaz-api`

### 4. **LocalStorage Keys** (All prefixes changed from `matchmint_` to `hetnaz_`)
- `frontend/src/core/utils/auth.ts`:
  - `hetnaz_auth_token`
  - `hetnaz_refresh_token`
  - `hetnaz_user`
  - `hetnaz_auth_timestamp`

- `frontend/src/core/context/GlobalStateContext.tsx`:
  - `hetnaz_user`
  - `hetnaz_auth_token`
  - `hetnaz_balance_cache`
  - `hetnaz_chat_cache`
  - `hetnaz_notifications_persistent`

- `frontend/src/core/hooks/usePermissions.ts`:
  - `hetnaz_camera_permission`
  - `hetnaz_microphone_permission`
  - `hetnaz_location_permission`
  - `hetnaz_permissions_requested`

- `frontend/src/core/services/indexedDB.service.ts`:
  - Database name: `hetnaz_cache`

- `frontend/src/core/services/offlineQueue.service.ts`:
  - Queue key: `hetnaz_message_queue`

### 5. **Cloudinary Upload Paths**
- `frontend/src/core/actions/uploadActions.ts`:
  - `matchmint/profiles` → `hetnaz/profiles`
  - `matchmint/verification` → `hetnaz/verification`
  - `matchmint/chat` → `hetnaz/chat`

### 6. **Display Text**
- `frontend/src/module/female/pages/FemaleDashboard.tsx`:
  - Welcome message: "Welcome to HETNAZ"

- `frontend/src/module/admin/pages/SettingsPage.tsx`:
  - Platform name: "HETNAZ"
  - Support email: `support@hetnaz.com`
  - URLs: `https://hetnaz.com/terms`, `https://hetnaz.com/privacy`

- `frontend/src/core/services/config.service.ts`:
  - Platform name: "HETNAZ"
  - Support email: `support@hetnaz.com`

---

## ✅ Backend Changes

### 1. **Package Configuration**
- `backend/package.json`:
  - Package name: `matchmint-backend` → `hetnaz-backend`
  - Keywords: `matchmint` → `hetnaz`

### 2. **Logger Service**
- `backend/src/utils/logger.js`:
  - Service name: `matchmint-backend` → `hetnaz-backend`

### 3. **Cloudinary Upload Paths**
- `backend/src/services/upload/imageUploadService.js`:
  - Folder path: `matchmint/${folder}` → `hetnaz/${folder}`

### 4. **App Settings Model**
- `backend/src/models/AppSettings.js`:
  - Platform name default: "HETNAZ"
  - Support email default: `support@hetnaz.com`

---

## 🎨 Branding Guidelines

### App Name Display
- **Full Name**: HETNAZ (all caps)
- **Usage**: Use "HETNAZ" in:
  - App titles
  - Welcome messages
  - Platform settings
  - Public-facing text

### Technical References
- **Package names**: `hetnaz-dating-frontend`, `hetnaz-backend`
- **Storage keys**: `hetnaz_` prefix (lowercase)
- **Cache names**: `hetnaz-` prefix (lowercase with hyphen)
- **Folder paths**: `hetnaz/` (lowercase)

### Contact Information
- **Support Email**: support@hetnaz.com
- **Website**: hetnaz.com
- **Terms**: https://hetnaz.com/terms
- **Privacy**: https://hetnaz.com/privacy

---

## 📝 Notes

1. **User Data Migration**: Existing users will need to re-login as localStorage keys have changed. Consider implementing a migration script if you want to preserve user sessions.

2. **Cloudinary**: Existing uploaded images in `matchmint/*` folders will remain accessible. New uploads will go to `hetnaz/*` folders.

3. **Service Worker**: The cache version change will automatically clear old caches on next app load.

4. **Build Status**: ✅ Frontend build successful (20.35s)

---

## 🚀 Next Steps

1. **Update Domain**: Point `hetnaz.com` to your hosting
2. **Email Setup**: Configure `support@hetnaz.com` email
3. **SSL Certificate**: Ensure HTTPS for hetnaz.com
4. **App Store**: Update app name in Play Store/App Store listings
5. **Social Media**: Update branding across social platforms
6. **Logo**: Create and replace `/vite.svg` with HETNAZ logo
7. **Favicon**: Update favicon to match HETNAZ branding

---

**Rebranding Completed**: ✅
**Date**: January 15, 2026
**Build Status**: All builds passing
