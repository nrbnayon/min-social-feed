/**
 * index.tsx  (Splash Screen entry point)
 *
 * Displays the TodAI logo on dynamic background for 2.5s and automatically redirects:
 * - If authenticated -> /(protected)
 * - If not authenticated -> /(auth)/login
 */

import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/store/auth.store";

export default function Index() {
  const { token } = useAuth();
  return <Redirect href={token ? "/(app)" : "/(auth)/login"} />;
}
