import React, { useEffect } from "react";
import { Text, View, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "@/store/useToastStore";
import { useAppTheme } from "@/context/ThemeContext";

export function Toast() {
  const { toast, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();

  if (!toast) return null;

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(15)}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.container,
        {
          top: insets.top + (Platform.OS === "ios" ? 10 : 16),
          backgroundColor: isDark ? "rgba(20, 23, 34, 0.95)" : "rgba(255, 255, 255, 0.95)",
          borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)",
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.content}>
        {toast.icon && <Text style={styles.icon}>{toast.icon}</Text>}
        <Text
          style={[
            styles.message,
            { color: isDark ? "#F0F2FA" : "#0F172A" },
          ]}
        >
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 9999,
    alignSelf: "center",
    maxWidth: 400,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  message: {
    fontSize: 13,
    fontWeight: "600",
  },
});
