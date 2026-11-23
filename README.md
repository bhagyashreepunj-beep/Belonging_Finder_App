# Belongings Finder Mobile Application
### Personal Belongings Finder – AI-Powered Memory & Inventory Assistant

Built with **React Native (Expo SDK 58)**, **TypeScript**, and **Supabase (PostgreSQL + RLS)**.

---

## 🚀 Quick Start Guide

### 1. Start Development Server
Open your terminal inside the `belongings-finder-app` folder:
```powershell
cd belongings-finder-app
npm start
```

### 2. Run on Your Device or Simulator
From the Expo CLI interactive terminal:
* Press `w` to open the app directly in your **Web Browser**.
* Press `a` to open on an **Android Emulator** (or scan the QR code with the **Expo Go** app on your physical Android phone).
* Press `i` to open on an **iOS Simulator** (or scan the QR code with the camera on your iPhone).

---

## 🔐 Supabase Configuration (Optional for Cloud Sync)

The application includes an **instant Demo Mode** allowing you to test and navigate all screens immediately without external credentials.

To connect your live Supabase cloud database:
1. Copy `.env.example` to `.env`:
   ```powershell
   cp .env.example .env
   ```
2. Populate your project credentials from your Supabase dashboard:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```
3. Restart the Expo server (`npm start`). The app will automatically connect to your cloud database!

---

## 📁 Project Architecture

```
belongings-finder-app/
├── App.tsx                    # Root application entry with Providers
├── src/
│   ├── config/
│   │   └── supabase.ts        # Supabase client with AsyncStorage session persistence
│   ├── constants/
│   │   ├── theme.ts           # Central UI tokens (colors, typography, spacing, shadows)
│   │   └── categories.ts      # Default item categories and metadata
│   ├── context/
│   │   └── AuthContext.tsx    # Supabase authentication & demo session provider
│   ├── types/
│   │   └── index.ts           # Strict TypeScript interfaces for items, locations, routes
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx     # Reusable button with loading, variants, and icons
│   │   │   ├── Input.tsx      # Labeled text input with validation and error states
│   │   │   ├── Card.tsx       # Elevated container component
│   │   │   └── Header.tsx     # Screen header with breadcrumbs and actions
│   │   └── layout/
│   │       └── ScreenContainer.tsx # SafeArea and keyboard-avoiding wrapper
│   ├── navigation/
│   │   ├── AppNavigator.tsx   # Root navigation switcher (Auth vs Main)
│   │   ├── AuthNavigator.tsx  # Login and registration stack
│   │   └── TabNavigator.tsx   # 5-tab main bottom bar
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.tsx
│       │   └── RegisterScreen.tsx
│       ├── home/
│       │   └── HomeScreen.tsx
│       ├── search/
│       │   └── SearchScreen.tsx
│       ├── add/
│       │   └── AddScreen.tsx
│       ├── locations/
│       │   └── LocationsScreen.tsx
│       └── profile/
│           └── ProfileScreen.tsx
```
