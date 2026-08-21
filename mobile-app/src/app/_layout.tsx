import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useAppTheme } from "@/context/ThemeContext";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/store/auth.store";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  registerForPushNotificationsAsync,
  registerBackgroundNotificationTask,
  storePushTokenLocally,
} from "@/services/pushNotifications";
import "../../global.css";

function AppContent() {
  const { isDark } = useAppTheme();
  const initializeAuth = useAuth((s) => s.initialize);

  // Attach foreground & tap listeners globally — handles deep-link routing
  usePushNotifications();

  useEffect(() => {
    initializeAuth();
  }, []);

  // ── Push notification bootstrap (runs once on first app open) ─────────────
  // Step 1: Ask permission + get Expo push token → store LOCALLY only.
  // Step 2 (in auth.store): After REAL login/register → read stored token
  //         → POST to backend so it links to the actual DB user.
  //
  // We intentionally do NOT send the token to the backend here because at this
  // point there may be no real authenticated user (demo mode / not logged in).
  // Push notifications only work when a token is linked to a real MongoDB user.
  useEffect(() => {
    void (async () => {
      // Background task must be registered before any push can arrive
      await registerBackgroundNotificationTask();

      // Request permission + obtain token. Shows OS dialog on first install.
      const expoPushToken = await registerForPushNotificationsAsync();

      // Cache the token locally — auth.store will upload it after real login
      if (expoPushToken) {
        await storePushTokenLocally(expoPushToken);
      }
    })();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? "#090A12" : "#F8FAFC",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}