import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/context/ThemeContext";
import { HomeIcon, ExploreIcon, LearnIcon, QuizIcon, ProfileIcon } from "./Icon";

const TABS = [
  { name: "index", label: "Home" },
  { name: "discover", label: "Explore" },
  { name: "learn", label: "Learn" },
  { name: "quiz", label: "Quiz" },
  { name: "profile", label: "Profile" },
] as const;

export function CustomTabBar({
  state,
  navigation,
  descriptors,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const isDark = theme === "dark";

  const visibleRoutes = state.routes.filter((route) =>
    TABS.some((tab) => tab.name === route.name)
  );

  const currentRoute = state.routes[state.index];
  const { options } = descriptors[currentRoute.key];

  if (options.tabBarStyle && (options.tabBarStyle as any).display === "none") {
    return null;
  }

  // Soft, subtle gradient stops
  const gradientColors = isDark
    ? (["transparent", "rgba(18, 18, 18, 0.3)", "rgba(18, 18, 18, 0.75)"] as const)
    : (["transparent", "rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.75)"] as const);

  return (
    <>
      {/* ── 1. ULTRA-SOFT SUBTLE BOTTOM BACKDROP MASK ── */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom + 35,
        }}
      >
        <LinearGradient colors={gradientColors} style={{ flex: 1 }} />
      </View>

      {/* ── 2. FLOATING TEAL TAB BAR DOCK ── */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom > 0 ? 10 : 8,
          left: 16,
          right: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#0F766E",
          borderRadius: 36,
          paddingVertical: 8,
          paddingHorizontal: 10,
          shadowColor: "#0F766E",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {visibleRoutes.map((route) => {
          const routeIndex = state.routes.indexOf(route);
          const isFocused = state.index === routeIndex;
          const tab = TABS.find((t) => t.name === route.name)!;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const renderTabIcon = (focused: boolean) => {
            const opacity = focused ? 1 : 0.5;

            if (tab.name === "index") {
              return <HomeIcon size={20} color="#0F766E" opacity={opacity} />;
            }
            if (tab.name === "discover") {
              return <ExploreIcon size={26} color="#0F766E" opacity={opacity} />;
            }
            if (tab.name === "learn") {
              return <LearnIcon size={22} color="#0F766E" opacity={opacity} />;
            }
            if (tab.name === "quiz") {
              return <QuizIcon size={22} color="#0F766E" opacity={opacity} />;
            }
            if (tab.name === "profile") {
              return <ProfileIcon size={22} color="#0F766E" opacity={opacity} />;
            }
            return null;
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              {isFocused ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F0FDFA",
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 24,
                    gap: 5,
                  }}
                >
                  {renderTabIcon(true)}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: "#0F766E",
                    }}
                  >
                    {tab.label}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#F0FDFA",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {renderTabIcon(false)}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}