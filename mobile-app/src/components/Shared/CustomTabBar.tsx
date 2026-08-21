import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { Avatar } from "./Avatar";
import { Gradients } from "@/constants/theme";
import {
  Home,
  Search,
  Plus,
  Bell,
  User as UserIcon,
} from "lucide-react-native";

export function CustomTabBar({
  state,
  navigation,
  descriptors,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const notifications = usePostsStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const user = useAuth((s) => s.user);

  const currentRoute = state.routes[state.index];
  const { options } = descriptors[currentRoute.key];

  if (options.tabBarStyle && (options.tabBarStyle as any).display === "none") {
    return null;
  }

  // Filter out any hidden screens
  const tabs = [
    { name: "index", label: "Home", icon: Home },
    { name: "explore", label: "Explore", icon: Search },
    { name: "create-post", label: "Create", isFab: true },
    { name: "notifications", label: "Alerts", icon: Bell, badge: unreadCount },
    { name: "profile", label: "Profile", icon: UserIcon, isProfile: true },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: isDark ? "rgba(12, 14, 23, 0.94)" : "rgba(255, 255, 255, 0.94)",
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            if (routeIndex !== -1) {
              const route = state.routes[routeIndex];
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            } else {
              navigation.navigate(tab.name as never);
            }
          };

          if (tab.isFab) {
            return (
              <Pressable
                key={tab.name}
                onPress={onPress}
                style={({ pressed }) => [
                  styles.fabButton,
                  pressed && { transform: [{ scale: 0.94 }] },
                ]}
              >
                <LinearGradient
                  colors={Gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.fabGradientBorder}
                >
                  <View
                    style={[
                      styles.fabInner,
                      {
                        backgroundColor: isDark ? "#0F111A" : "#FFFFFF",
                      },
                    ]}
                  >
                    <Plus size={20} color={isDark ? "#FFFFFF" : colors.brand} strokeWidth={2.6} />
                  </View>
                </LinearGradient>
              </Pressable>
            );
          }

          const IconComponent = tab.icon!;
          const activeColor = colors.brand2;
          const inactiveColor = colors.text3;

          return (
            <Pressable
              key={tab.name}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={styles.iconWrapper}>
                {tab.isProfile && user ? (
                  <View
                    style={[
                      styles.profileAvatarBorder,
                      isFocused && { borderColor: colors.brand, borderWidth: 2 },
                    ]}
                  >
                    <Avatar src={user.avatar} size={24} name={user.name} />
                  </View>
                ) : (
                  <IconComponent
                    size={22}
                    color={isFocused ? activeColor : inactiveColor}
                    strokeWidth={isFocused ? 2.5 : 2}
                  />
                )}

                {Boolean(tab.badge && tab.badge > 0) && (
                  <View style={[styles.badge, { backgroundColor: colors.pink }]}>
                    <Text style={styles.badgeText}>
                      {tab.badge! > 9 ? "9+" : tab.badge}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? activeColor : inactiveColor,
                    fontWeight: isFocused ? "700" : "500",
                  },
                ]}
              >
                {tab.label}
              </Text>

              {isFocused && (
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: colors.brand },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    minHeight: 48,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 26,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800",
  },
  fabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  fabGradientBorder: {
    width: 44,
    height: 44,
    borderRadius: 14,
    padding: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabInner: {
    width: "100%",
    height: "100%",
    borderRadius: 12.5,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarBorder: {
    borderRadius: 14,
    padding: 1,
  },
});