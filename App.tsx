import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { BelongingsProvider } from './src/context/BelongingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <BelongingsProvider>
          <AppNavigator />
        </BelongingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
