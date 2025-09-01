# 🔧 Tunnel Error Fix - Step by Step Solution

## ❌ **Current Issues Identified:**

1. **URL Mismatch**: API configured for `tasty-grapes-sleep.loca.lt` but tunnel shows different domain
2. **Endpoint IP Error**: "endpoint IP is not correct" message
3. **Tunnel Password**: IP `124.43.209.180` shown as password

## ✅ **Quick Fix Solution:**

### **Step 1: Get Your Current Tunnel URL**
In the terminal where you ran `lt --port 5000 --print-requests`, look for the output like:
```
your url is: https://[some-words].loca.lt
```

### **Step 2: Update Your Mobile App API URL**
Update `src/MobileApp/config/api.ts` with the correct tunnel URL from Step 1:

```typescript
return 'https://[YOUR-ACTUAL-TUNNEL-URL].loca.lt/api';
```

### **Step 3: Enter Tunnel Password**
- **Password**: Use the IP shown (`124.43.209.180`)
- **Click "Click to Submit"**
- This only needs to be done once per tunnel session

### **Step 4: Alternative - Restart Tunnel Without Password**
```bash
# Stop current tunnel (Ctrl+C)
# Restart with subdomain (no password needed)
lt --port 5000 --subdomain disaster-platform --print-requests
```

Then update api.ts to:
```typescript
return 'https://disaster-platform.loca.lt/api';
```

## 🎯 **Recommended Solution:**

### **Option A: Use the Password (Quick)**
1. **Enter password**: `124.43.209.180`
2. **Click Submit** in the WebView
3. **SLUDI authentication should load**

### **Option B: Restart with Custom Subdomain (Better)**
1. **Stop tunnel**: Ctrl+C in backend terminal
2. **Restart**: `lt --port 5000 --subdomain ndp-sludi --print-requests`
3. **Update api.ts**: `https://ndp-sludi.loca.lt/api`
4. **Rebuild mobile app**: `npx react-native run-android`

## 🚀 **After Fix:**

### **Expected Flow:**
1. **Tap SLUDI button** → Loads mock auth form
2. **Enter credentials**: 
   - ID: `citizen001`
   - OTP: `123456`
3. **Submit** → Redirect to callback
4. **Login success** → Dashboard access

### **Console Logs to Expect:**
```
🌐 Generated mock SLUDI URL: https://[tunnel].loca.lt/api/mobile/mock-sludi-auth
🌐 WebView navigation: [tunnel-url]/mock-sludi-auth
✅ Authorization code received
```

## 🔧 **Backend Updates Applied:**
- ✅ **Dynamic tunnel URL** detection
- ✅ **Flexible host handling** 
- ✅ **Proper API path** structure
- ✅ **Enhanced logging**

---

**Choose Option A for immediate testing or Option B for a cleaner long-term solution!**
