import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useAuth } from "@/store/auth.store";
import { useAppTheme } from "@/context/ThemeContext";

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark } = useAppTheme();

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace("/(protected)");
        } else {
          router.replace("/(auth)/login");
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#090A12" : "#F8FAFC" },
      ]}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {/* App Icon Image */}
        <Image
          source={require("@/assets/icons/appIcon.png")}
          style={styles.logoBadge}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: colors.text }]}>
          MiniSocial
        </Text>
        <Text style={[styles.subtitle, { color: colors.text2 }]}>
          Connect • Share • Discover
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logoBadge: {
    width: 200,
    height: 200,
    // borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    // shadowColor: "#6366F1",
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.45,
    // shadowRadius: 20,
    // elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
    letterSpacing: -0.2,
  },
});
