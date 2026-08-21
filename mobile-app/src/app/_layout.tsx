import { Stack } from "expo-router";
import React from "react";
import "../../global.css";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}