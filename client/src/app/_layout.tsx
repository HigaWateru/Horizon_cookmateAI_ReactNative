import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import AuthScreen from '@/components/auth';
import tokenStorage from '../services/tokenStorage';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await tokenStorage.getAccessToken();
      setIsAuthenticated(!!token);
      SplashScreen.hideAsync().catch(() => {});
    };

    tokenStorage.setListener((authStatus) => {
      setIsAuthenticated(authStatus);
    });

    checkAuth();

    return () => {
      tokenStorage.setListener(() => {});
    };
  }, []);

  return (
    <ThemeProvider value={DefaultTheme}>
      {!isAuthenticated ? (
        <AuthScreen onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <>
          <AnimatedSplashOverlay />
          <AppTabs />
        </>
      )}
    </ThemeProvider>
  );
}
