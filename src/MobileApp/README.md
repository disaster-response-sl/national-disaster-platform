# National Disaster Platform - Mobile App

🏆 **1st Runner-up at CodeFest Revivation Hackathon** 🏆

This is a disaster response mobile application built with [**React Native**](https://reactnative.dev) and TypeScript. The app provides real-time disaster alerts, risk assessment, resource management, and emergency communication for users in disaster-prone areas.

## Features

- 🚨 Real-time disaster alerts and notifications
- 📍 Location-based risk assessment
- 🗺️ Interactive disaster risk maps
- 📱 Emergency SOS functionality
- 💬 In-app communication and chat
- 🌐 Offline mode support
- 🔒 Secure authentication with JWT
- 🌍 Multi-language support
- 📊 Resource management and tracking

## Tech Stack

- **React Native** with TypeScript
- **React Navigation** for navigation
- **Axios** for API calls
- **AsyncStorage** for local data persistence
- **Geolocation** for location services
- **Push Notifications** with custom notification service
- **Offline Support** with network detection

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Quick Setup for This Project

1. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

2. **Install iOS dependencies (iOS only):**
   ```sh
   cd ios
   pod install
   cd ..
   ```

3. **Set up Android emulator or connect physical device**

4. **Start Metro bundler:**
   ```sh
   npm start
   # or
   yarn start
   ```

5. **Run the app:**
   ```sh
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

## Android Build Issues

### No Connected Devices Error

If you encounter `No connected devices!` error, try these solutions:

1. **Enable USB Debugging on your device:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

2. **Set up Android Emulator:**
   ```sh
   # Check available AVDs
   emulator -list-avds
   
   # If no AVDs exist, create one using Android Studio:
   # Open Android Studio > AVD Manager > Create Virtual Device
   ```

3. **Check ADB connection:**
   ```sh
   # Check connected devices
   adb devices
   
   # If device not listed, restart ADB
   adb kill-server
   adb start-server
   ```

4. **Alternative: Use physical device with port forwarding:**
   ```sh
   # Connect device via USB and run
   adb reverse tcp:8081 tcp:8081
   npx react-native run-android
   ```

5. **Check React Native doctor:**
   ```sh
   npx react-native doctor
   ```

### Port 8081 Already in Use

```sh
# Kill process on port 8081
npx kill-port 8081

# Or use different port
npx react-native start --port 8083
```

### Gradle Build Issues

```sh
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

If you're having other issues, see the [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
