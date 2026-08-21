import { Stack } from "expo-router";
import React from "react";
import { useAppTheme } from "@/context/ThemeContext";

export default function AuthLayout() {
  const { isDark } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? "#090A12" : "#F8FAFC",
        },
      }}
    />
  );
}
