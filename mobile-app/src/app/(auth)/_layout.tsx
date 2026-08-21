import { useAuth } from "@/store/auth.store";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const { token, isLoading } = useAuth();

  if (!isLoading && token) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
