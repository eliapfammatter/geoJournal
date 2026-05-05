# GeoJournal – Setup Guide

## 1. Install Prerequisites

Make sure you have **Node.js 18+** installed: https://nodejs.org

## 2. Install Project Dependencies

Open a terminal in the `GeoJournal` folder and run:
```bash
npm install
```

## 3. Run the App

```bash
npx expo start --localhost
```

Then press **`i`** to open the iOS Simulator (requires Xcode on Mac).

> **Note:** Running on a physical iPhone via Expo Go requires your phone and Mac to be on the same Wi-Fi network. If the connection fails, use `npx expo run:ios` to build and install the app directly.

## Project Structure

```
GeoJournal/
├── app/
│   ├── _layout.jsx          # Root layout + auth guard
│   ├── (auth)/              # Login / register screens
│   └── (tabs)/
│       ├── _layout.jsx      # Tab bar config
│       ├── index.jsx        # Explore (map + nearby places + compass)
│       ├── camera.jsx       # Camera with GPS overlay + weather
│       ├── journal.jsx      # Photo gallery (grid / map view)
│       └── profile.jsx      # Travel stats + sign out
├── context/
│   └── AuthContext.jsx      # Firebase auth state
├── utils/
│   ├── geofencing.js        # Background geofencing task
│   ├── notifications.js     # Push notification helpers
│   ├── places.js            # Nearby places fetching
│   └── stats.js             # AsyncStorage stats tracking
├── firebaseConfig.js        # Firebase project config
├── app.json                 # Expo config + permissions
├── package.json
└── babel.config.js
```

## APIs & Services Used
- **Firebase** – authentication
- **Open-Meteo** – weather (free, no API key needed)
- **expo-location** – GPS + geofencing
- **expo-camera** – camera
- **react-native-maps** – maps
- **AsyncStorage** – local storage for photo locations and stats
- **expo-notifications** – push notifications
