import React from "react";
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/Shared/CustomTabBar";
import { useAppTheme } from "@/context/ThemeContext";

export default function ProtectedLayout() {
  const { colors, isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#090A12" : "#FFFFFF",
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="create-post" options={{ title: "Create" }} />
      <Tabs.Screen name="notifications" options={{ title: "Alerts" }} />
      <Tabs.Screen name="setting" options={{ title: "Settings" }} />

      {/* Hidden sub-screens */}
      <Tabs.Screen
        name="post/[id]"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="user/[id]"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
