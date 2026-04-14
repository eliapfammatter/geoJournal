# GeoJournal – Setup Guide

## 1. Install Prerequisites

Make sure you have **Node.js 18+** installed: https://nodejs.org

Install Expo CLI globally:
```bash
npm install -g expo-cli
```

## 2. Install Project Dependencies

Open a terminal in the `GeoJournal` folder and run:
```bash
npm install
```

## 3. Run the App

```bash
npx expo start
```

This opens the Expo Dev Tools. You can then:
- **Scan the QR code** with the **Expo Go** app on your phone (iOS or Android)
- Press **`i`** to open the iOS Simulator (requires Xcode on Mac)
- Press **`a`** to open the Android Emulator (requires Android Studio)

## 4. Install Expo Go on your phone
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

## Project Structure

```
GeoJournal/
├── app/
│   ├── _layout.jsx          # Root layout
│   └── (tabs)/
│       ├── _layout.jsx      # Tab bar config
│       ├── index.jsx        # Explore (map + nearby places)
│       ├── camera.jsx       # Smart camera with GPS + weather
│       ├── journal.jsx      # Photo gallery (grid / map view)
│       └── profile.jsx      # Travel stats dashboard
├── app.json                 # Expo config + permissions
├── package.json
└── babel.config.js
```

## APIs Used
- **Open-Meteo** (weather) – free, no API key needed
- **expo-location** – GPS
- **expo-camera** – camera
- **react-native-maps** – maps

## Next Steps
- Connect a real "nearby places" API (e.g. Foursquare or Google Places)
- Save photo metadata (GPS, weather) to AsyncStorage
- Add geofencing notifications with expo-location
- Show GPS-tagged photos as pins on the Journal map
