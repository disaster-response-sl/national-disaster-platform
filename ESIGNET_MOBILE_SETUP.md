🔐 **eSignet Mobile Integration - Quick Setup**

## ✅ Redirect URI for eSignet Registration:
```
ndp://dashboard
```

## 📱 How it works:
1. User taps eSignet login button in mobile app
2. App opens eSignet authentication in browser
3. User authenticates with eSignet 
4. eSignet redirects back to: `ndp://dashboard`
5. Mobile app opens directly to dashboard screen
6. Dashboard screen automatically handles the auth code from URL params

## 🧪 Test the Integration:

### Option 1: Test with Browser
Open this URL in mobile browser:
```
ndp://dashboard?code=test123&state=mobile_test
```

### Option 2: Test with eSignet Button
1. Open mobile app
2. Go to Login screen  
3. Tap "Login with eSignet" button
4. Complete authentication in browser
5. App will automatically redirect to dashboard

## 📋 Configuration Summary:

**Mobile App Deep Link:** `ndp://dashboard`
**Android Manifest:** ✅ Updated with intent filter
**Navigation:** ✅ Deep link routing configured  
**Dashboard Screen:** ✅ Auth code handling added
**Config File:** ✅ REDIRECT_URI set to "ndp://dashboard"

## 🎯 What to register with ICTA:
- **Client ID:** (You'll get this from ICTA)
- **Redirect URI:** `ndp://dashboard`
- **App Name:** National Disaster Platform Mobile
- **Platform:** Mobile (Android/iOS)

## ✅ CONFIRMED: 
The redirect URI is correctly set to **`ndp://dashboard`** throughout the codebase. No "profile" references remain.
