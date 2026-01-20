# Google Maps Location + Distance Privacy Implementation

## ✅ COMPLETED COMPONENTS

### 1. Backend - Data Models
- ✅ **User Model** (`backend/src/models/User.js`)
  - Added `profile.locationString` (e.g., "Mumbai, Maharashtra")
  - Added `profile.latitude` and `profile.longitude` for simple access
  - Kept existing GeoJSON `profile.location.coordinates` for MongoDB queries

### 2. Frontend - Core Utilities
- ✅ **Distance Calculator** (`frontend/src/utils/distanceCalculator.ts`)
  - Haversine formula implementation
  - Privacy buckets: "< 1 km", "2 km", "5 km", "10 km", etc.
  - Coordinate validation

- ✅ **Backend Distance Calculator** (`backend/src/utils/distanceCalculator.js`)
  - Same Haversine formula for backend use
  - Formatted distance output

### 3. Frontend - UI Components
- ✅ **GoogleMapsAutocomplete** (`frontend/src/shared/components/GoogleMapsAutocomplete.tsx`)
  - Google Places API integration
  - India-focused autocomplete (cities/localities)
  - Extracts both address string AND coordinates
  - Graceful fallback to plain input if API fails

- ✅ **LocationPromptModal** (UPDATED - `frontend/src/shared/components/LocationPromptModal.tsx`)
  - Now uses GoogleMapsAutocomplete
  - Saves both `location` string and `latitude/longitude` to backend

### 4. Dashboard Integration
- ✅ **MaleDashboard** (`frontend/src/module/male/pages/MaleDashboard.tsx`)
  - Shows location prompt on first access if location is empty
  
- ✅ **FemaleDashboard** (`frontend/src/module/female/pages/FemaleDashboard.tsx`)
  - Shows location prompt after approval if location is empty

### 5. Profile Edit (Partial)
- ✅ **MaleProfileEditPage** - Added GoogleMapsAutocomplete import
- 🔲 **City field replacement** - NOT YET DONE (see below)

---

## 🔲 REMAINING TASKS

### CRITICAL - Complete Profile Edit Pages:

#### 1. **MaleProfileEditPage** (`frontend/src/module/male/pages/MaleProfileEditPage.tsx`)
**Lines 244-258** - Replace city input:
```tsx
// CURRENT (plain input):
<input
  type="text"
  value={editedProfile.city || ''}
  onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
  ...
/>

// REPLACE WITH:
<GoogleMapsAutocomplete
  value={editedProfile.city || ''}
  onChange={(value, coords) => {
    const updates = { ...editedProfile, city: value };
    // Store coordinates in temporary state
    if (coords) {
      updates.latitude = coords.lat;
      updates.longitude = coords.lng;
    }
    setEditedProfile(updates);
  }}
  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2f151e] border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
  placeholder="Enter your city"
/>
```

**Line 67-77** - Update handleSave to include coordinates:
```tsx
// ADD coordinates to API call
await axios.patch(`${API_URL}/users/me`, {
  name: editedProfile.name,
  age: editedProfile.age,
  city: editedProfile.city,
  occupation: editedProfile.occupation,
  bio: editedProfile.bio,
  interests: editedProfile.interests,
  photos: editedProfile.photos,
  // ADD THESE:
  latitude: editedProfile.latitude,
  longitude: editedProfile.longitude,
}, ...);
```

#### 2. **Female Profile Edit** (if exists)
Check if `frontend/src/module/female/pages/FemaleProfileEditPage.tsx` or similar exists.
If yes, apply same GoogleMapsAutocomplete changes.

---

### CRITICAL - Backend API Updates:

#### 3. **User Controller** (`backend/src/controllers/userController.js`)

**Update `PATCH /users/me` endpoint** to accept coordinates:
```javascript
// In updateProfile or similar function:
const { location, latitude, longitude, ...otherFields } = req.body;

const updates = {
  ...otherFields,
  'profile.locationString': location,
};

if (latitude && longitude) {
  updates['profile.latitude'] = latitude;
  updates['profile.longitude'] = longitude;
  
  // Update GeoJSON as well
  updates['profile.location.coordinates.coordinates'] = [longitude, latitude];
}

await User.findByIdAndUpdate(userId, updates);
```

#### 4. **Add Distance to User Profiles**

**When returning other users' profiles** (e.g., discover page, chat list):
```javascript
import { calculateDistance, formatDistance, areCoordinatesValid } from '../utils/distanceCalculator.js';

// In getUsers, getUserProfile, etc:
const currentUser = await User.findById(req.user.id);
const otherUsers = await User.find({ ... });

const usersWithDistance = otherUsers.map(user => {
  const userObj = user.toObject();
  
  // NEVER send coordinates to frontend for other users
  delete userObj.profile.latitude;
  delete userObj.profile.longitude;
  delete userObj.profile.location;
  delete userObj.profile.locationString;
  
  // Calculate and add distance if both users have coordinates
  if (areCoordinatesValid(currentUser.profile.latitude, currentUser.profile.longitude) &&
      areCoordinatesValid(user.profile.latitude, user.profile.longitude)) {
    const distance = calculateDistance(
      { lat: currentUser.profile.latitude, lng: currentUser.profile.longitude },
      { lat: user.profile.latitude, lng: user.profile.longitude }
    );
    userObj.distanceKm = distance;
    userObj.distanceFormatted = formatDistance(distance);
  } else {
    userObj.distanceFormatted = 'Location not set';
  }
  
  return userObj;
});
```

---

### IMPORTANT - Frontend Profile Display:

#### 5. **ProfileCard Components** 
Update to show distance instead of location:

**Male ProfileCard** (`frontend/src/module/male/components/ProfileCard.tsx`):
```tsx
// REPLACE location display with:
{user.distanceFormatted && (
  <div className="flex items-center gap-1 text-sm text-gray-600">
    <MaterialSymbol name="location_on" size={16} />
    <span>{user.distanceFormatted}</span>
  </div>
)}
```

**Female ProfileCard** (similar changes if exists)

#### 6. **Chat/Discover Pages**
Ensure all user profile displays show distance, not location:
- Discover/swipe pages
- Chat lists
- User profile views
- Search results

---

### OPTIONAL - Enhanced Features:

#### 7. **Sort by Distance**
Add "Sort by distance" option in discover page:
```javascript
// Backend: Add to user query
.sort({ 'profile.latitude': 1 }) // Or custom distance-based sort
```

#### 8. **Distance Filter**
Allow users to set max distance preference:
```javascript
// Filter users within X km
const maxDistanceKm = user.preferences.maxDistance || 50;
// Use MongoDB $geoNear or filter in application logic
```

#### 9. **Admin Panel**
Decide if admins should see:
- ✅ Exact location + coordinates (for verification)
- ❌ Just distance like regular users

---

## 📋 TESTING CHECKLIST

### Location Input:
- [ ] New user signup → No location set → Dashboard shows location prompt
- [ ] Select location from Google autocomplete → Location + coordinates saved
- [ ] Manually type location (not from dropdown) → Location saved without coordinates
- [ ] API fails → Fallback to plain input works

### Profile Edit:
- [ ] Edit profile → City field has autocomplete
- [ ] Select city from autocomplete → Coordinates updated
- [ ] Save profile → Location and coordinates persisted

### Distance Display:
- [ ] View other user's profile → See "5 km away" instead of exact location
- [ ] View own profile → See own exact location (for editing)
- [ ] User without coordinates → See "Location not set"
- [ ] Both users without coordinates → See "Location not set"

### Privacy:
- [ ] Check network tab → Other users' coordinates NEVER sent to frontend
- [ ] Check API responses → Only `distanceFormatted` field present
- [ ] Admin view (if applicable) → Can see exact location

---

## 🔧 ENVIRONMENT SETUP

Ensure `.env` files have:

**Frontend** (`frontend/.env`):
```
VITE_GOOGLE_MAPS_AND_TRANSLATE_API=your_google_api_key_here
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```
# No Google API key needed on backend
```

---

## 🚨 SECURITY NOTES

1. **Google API Key**: Set domain restrictions in Google Cloud Console
2. **Coordinates Privacy**: NEVER expose other users' lat/lng to frontend
3. **Distance Bucket**: Use privacy-friendly buckets (already implemented)
4. **User Control**: Consider adding "Hide my location" option in future

---

## 📞 NEXT STEPS

1. **Complete MaleProfileEditPage** city field replacement (15 mins)
2. **Update User Controller** to accept/save coordinates (20 mins)
3. **Add distance calculation** to user profile endpoints (30 mins)
4. **Update ProfileCard components** to show distance (15 mins)
5. **Test end-to-end** flow (30 mins)

**Total estimated time: ~2 hours**

---

## 💡 QUESTIONS TO ANSWER

Before completing:
1. Should female profile edit also get autocomplete?
2. Should we geocode existing users' location strings (one-time migration)?
3. Should admins see exact locations or distances?
4. Do we want distance-based sorting/filtering now or later?
