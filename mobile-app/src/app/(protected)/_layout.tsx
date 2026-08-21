import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/store/auth.store";

export default function AppLayout() {
  const token = useAuth((state) => state.token);
  if (!token) return <Redirect href="/(auth)/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
