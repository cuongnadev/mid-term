import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/core/errors';
import { AuthProvider } from '@/features/auth/AuthContext';
import {
  PreferencesProvider,
  usePreferences,
} from '@/features/preferences/PreferencesProvider';
import { ThemeProvider, useTheme } from '@/theme';
import { ErrorFallback } from '@/ui/ErrorFallback';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AppShell() {
  const { colors, scheme } = useTheme();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
  }, [colors.background]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}

function ThemedRoot() {
  const preferences = usePreferences();

  useEffect(() => {
    if (preferences.ready) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [preferences.ready]);

  if (!preferences.ready) return null;

  return (
    <ThemeProvider
      initialMode="system"
      mode={preferences.theme}
      onModeChange={preferences.setTheme}
    >
      <ErrorBoundary
        fallback={(error, reset) => <ErrorFallback error={error} onReset={reset} />}
      >
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PreferencesProvider>
        <ThemedRoot />
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}