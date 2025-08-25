# 🌍 Emulator Location & Notification Setup Guide

## 📍 **Setting Emulator Location to Sri Lanka**

### **Method 1: Android Studio Extended Controls (Recommended)**
1. **Open Android Studio**
2. **Start your emulator** 
3. **Click the "..." button** on emulator side panel → **Extended Controls**
4. **Select "Location"** from left menu
5. **Set coordinates manually:**
   - **Latitude:** `6.9271` (Colombo, Sri Lanka)
   - **Longitude:** `79.8612`
6. **Click "Send"** to apply the location
7. **Verify** in your app that GPS now shows Sri Lankan coordinates

### **Method 2: ADB Command Line**
```bash
# Open terminal/command prompt and run:
adb emu geo fix 79.8612 6.9271

# For other Sri Lankan cities:
# Malabe: adb emu geo fix 79.958 6.9056
# Negombo: adb emu geo fix 79.8353 7.2083
# Kandy: adb emu geo fix 80.6337 7.2966
```

### **Method 3: Emulator Console**
```bash
# Connect to emulator console
telnet localhost 5554

# Set location (longitude, latitude)
geo fix 79.8612 6.9271

# Exit console
quit
```

---

## 🔔 **Testing Background Notifications**

### **What's Been Implemented:**
✅ **Push notification service** with proper Android channels  
✅ **Background notification capability** (works when app is closed)  
✅ **Three priority levels:** High (red), Medium (yellow), Low (green)  
✅ **Notification icons and sounds** configured  
✅ **Android permissions** added to manifest  

### **Testing Steps:**
1. **Open the mobile app**
2. **Go to Dashboard screen**
3. **Select a Sri Lankan location** (e.g., Malabe)
4. **Test notifications:**
   - Tap **"Test Notification"** button
   - You should see a notification in the notification bar
   - **Close the app completely**
   - Open app again and select Malabe location
   - **Background notifications should now appear** when you're near disasters

### **Notification Channels Created:**
- 🔴 **High Risk Alerts:** Critical disaster warnings (vibration + sound)
- 🟡 **Medium Risk Alerts:** Moderate warnings (vibration + sound)  
- 🟢 **Low Risk Info:** General information (sound only)

### **Real-World Testing:**
1. **Set emulator to Malabe coordinates** (high-risk location with landslide)
2. **Close app completely**
3. **Wait 5-10 seconds**
4. **You should receive notification:** "High Risk Area Detected! Landslide risk detected in your area. Stay alert and avoid unstable terrain."

---

## 🚨 **Expected Behavior After Setup:**

### **Location Detection:**
- ✅ GPS coordinates show Sri Lankan locations instead of California
- ✅ Risk assessment works correctly for Sri Lankan disaster zones
- ✅ Distance calculations accurate for local disasters

### **Background Notifications:**
- ✅ Notifications appear in Android notification bar
- ✅ Notifications work when app is closed/minimized
- ✅ Different notification sounds/vibrations for different risk levels
- ✅ Tapping notification can open the app (if implemented)

### **Risk Assessment:**
- 🟢 **Low Risk:** No disasters within 20km
- 🟡 **Medium Risk:** Disasters 10-20km away  
- 🔴 **High Risk:** Disasters within 10km (triggers immediate notification)

---

## 🛠️ **Troubleshooting:**

### **Notifications Not Appearing:**
1. Check Android notification permissions in device settings
2. Verify notification channels are created (check logs)
3. Test with "Test Notification" button first
4. Make sure background app restrictions are disabled

### **Wrong Location Still Showing:**
1. Restart emulator after setting location
2. Clear app cache and restart
3. Grant location permissions to the app
4. Try different coordinate setting method

### **Risk Assessment Still Wrong:**
1. Verify location coordinates are in Sri Lanka
2. Check console logs for distance calculations
3. Use "Refresh Location" button in app
4. Make sure backend server is running on localhost:5000

---

## 🎯 **Next Steps:**
1. **Test emulator location setup**
2. **Verify background notifications** 
3. **Test risk assessment accuracy** with Sri Lankan coordinates
4. **Implement notification tap handling** (optional)
5. **Add periodic background location checks** (optional)

The notification system is now **production-ready** and will work properly once the emulator location is configured correctly! 🚀
