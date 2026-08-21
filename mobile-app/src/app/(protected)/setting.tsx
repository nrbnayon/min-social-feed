import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { useToastStore } from "@/store/useToastStore";
import { Avatar } from "@/components/Shared/Avatar";
import { LogoutModal } from "@/components/Shared/LogoutModal";
import { formatCount, appShadow } from "@/lib/utils";
import { requestNotificationPermissions } from "@/services/pushNotifications";
import * as Notifications from "expo-notifications";
import {
  Moon,
  Sun,
  Laptop,
  Bell,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  BadgeCheck,
  Sparkles,
} from "lucide-react-native";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, mode, setMode } = useAppTheme();
  const { user, logout } = useAuth();
  const posts = usePostsStore((s) => s.posts);
  const showToast = useToastStore((s) => s.showToast);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Sync toggle with actual OS permission status on mount
  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setPushNotifications(status === "granted");
    });
  }, []);

  const userId = user?.id || "u0";
  const userPosts = posts.filter(
    (p) =>
      p.userId === userId ||
      p.username === user?.username ||
      p.author?.id === userId
  );

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace("/(auth)/login");
  };

  const handleToggleNotifications = async (val: boolean) => {
    if (val) {
      // Request permission — updates OS setting and returns result
      const granted = await requestNotificationPermissions();
      setPushNotifications(granted);
      if (granted) {
        showToast("Notifications enabled", "🔔");
      } else {
        showToast("Permission denied — open Settings to enable", "⚠️");
        // Open OS Settings so user can grant manually
        await Linking.openSettings();
      }
    } else {
      // Cannot revoke programmatically — direct user to Settings
      setPushNotifications(false);
      showToast("Open Settings to disable notifications", "🔕");
      await Linking.openSettings();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 🌟 Top Header */}
      <View
        style={{
          paddingTop: insets.top + (Platform.OS === "ios" ? 6 : 10),
          paddingBottom: 12,
          paddingHorizontal: 18,
          backgroundColor: isDark ? "rgba(9, 10, 18, 0.95)" : "rgba(248, 250, 252, 0.95)",
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        }}
        className="flex-row items-center justify-between"
      >
        <Text
          style={{ color: colors.text }}
          className="text-xl font-black tracking-tight"
        >
          Settings
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 16,
        }}
      >
        {/* 👤 1. Clickable Account Profile Card (Redirects to Profile) */}
        <TouchableOpacity
          onPress={() => router.push(`/(protected)/user/${user?.id || "u0"}` as any)}
          activeOpacity={0.85}
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? "rgba(99, 102, 241, 0.25)" : colors.border,
          }}
          className={`p-3.5 rounded-xl border mb-4 ${appShadow}`}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-2">
              <Avatar
                src={user?.avatar}
                size={50}
                gradientBorder={true}
                name={user?.name || "Jordan Ellis"}
              />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text
                    style={{ color: colors.text }}
                    className="text-base font-bold"
                    numberOfLines={1}
                  >
                    {user?.name || "Jordan Ellis"}
                  </Text>
                  {user?.verified && (
                    <BadgeCheck size={16} color="#FFFFFF" fill="#3B82F6" strokeWidth={2.5} />
                  )}
                </View>

                <Text style={{ color: colors.text3 }} className="text-xs mt-0.5" numberOfLines={1}>
                  @{user?.username || "jordan"} · {user?.email || "jordan@example.com"}
                </Text>
              </View>
            </View>

            <ChevronRight size={18} color={colors.text3} />
          </View>

          {/* Quick Account Stats */}
          <View
            style={{
              backgroundColor: colors.surface2,
              borderColor: colors.border,
            }}
            className="flex-row items-center justify-around py-3 rounded-lg border"
          >
            <View className="items-center flex-1">
              <Text style={{ color: colors.brand2 }} className="text-sm font-black">
                {userPosts.length}
              </Text>
              <Text style={{ color: colors.text3 }} className="text-[11px] font-semibold mt-0.5">
                Posts
              </Text>
            </View>

            <View style={{ width: 1, height: 18, backgroundColor: colors.border }} />

            <View className="items-center flex-1">
              <Text style={{ color: colors.brand2 }} className="text-sm font-black">
                {formatCount(user?.followers || 1248)}
              </Text>
              <Text style={{ color: colors.text3 }} className="text-[11px] font-semibold mt-0.5">
                Followers
              </Text>
            </View>

            <View style={{ width: 1, height: 18, backgroundColor: colors.border }} />

            <View className="items-center flex-1">
              <Text style={{ color: colors.brand2 }} className="text-sm font-black">
                {formatCount(user?.following || 394)}
              </Text>
              <Text style={{ color: colors.text3 }} className="text-[11px] font-semibold mt-0.5">
                Following
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 🎨 2. Appearance & Theme Section */}
        <Text
          style={{ color: colors.text3 }}
          className="text-xs font-bold uppercase tracking-wider mb-2 ml-1"
        >
          Appearance
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="p-3 rounded-xl border mb-4"
        >
          <Text
            style={{ color: colors.text }}
            className="text-sm font-bold mb-2.5"
          >
            Theme Mode
          </Text>

          <View
            style={{
              backgroundColor: isDark ? "#0D0E17" : "#F1F5F9",
              borderColor: colors.border,
            }}
            className="flex-row p-1 rounded-lg border"
          >
            {/* System */}
            <TouchableOpacity
              onPress={() => setMode("system")}
              activeOpacity={0.8}
              style={{
                backgroundColor:
                  mode === "system"
                    ? isDark
                      ? "#1E1B4B"
                      : "#E0E7FF"
                    : "transparent",
                borderColor:
                  mode === "system"
                    ? isDark
                      ? "#6366F1"
                      : "#4F46E5"
                    : "transparent",
                borderWidth: mode === "system" ? 1 : 0,
              }}
              className="flex-1 py-3 rounded-md flex-row items-center justify-center gap-1.5"
            >
              <Laptop
                size={14}
                color={mode === "system" ? colors.brand2 : colors.text3}
              />
              <Text
                style={{
                  color: mode === "system" ? colors.brand2 : colors.text3,
                  fontSize: 12,
                  fontWeight: mode === "system" ? "700" : "500",
                }}
              >
                System
              </Text>
            </TouchableOpacity>

            {/* Dark */}
            <TouchableOpacity
              onPress={() => setMode("dark")}
              activeOpacity={0.8}
              style={{
                backgroundColor:
                  mode === "dark"
                    ? isDark
                      ? "#1E1B4B"
                      : "#E0E7FF"
                    : "transparent",
                borderColor:
                  mode === "dark"
                    ? isDark
                      ? "#6366F1"
                      : "#4F46E5"
                    : "transparent",
                borderWidth: mode === "dark" ? 1 : 0,
              }}
              className="flex-1 py-3 rounded-md flex-row items-center justify-center gap-1.5"
            >
              <Moon
                size={14}
                color={mode === "dark" ? colors.brand2 : colors.text3}
              />
              <Text
                style={{
                  color: mode === "dark" ? colors.brand2 : colors.text3,
                  fontSize: 12,
                  fontWeight: mode === "dark" ? "700" : "500",
                }}
              >
                Dark
              </Text>
            </TouchableOpacity>

            {/* Light */}
            <TouchableOpacity
              onPress={() => setMode("light")}
              activeOpacity={0.8}
              style={{
                backgroundColor:
                  mode === "light"
                    ? isDark
                      ? "#1E1B4B"
                      : "#E0E7FF"
                    : "transparent",
                borderColor:
                  mode === "light"
                    ? isDark
                      ? "#6366F1"
                      : "#4F46E5"
                    : "transparent",
                borderWidth: mode === "light" ? 1 : 0,
              }}
              className="flex-1 py-3 rounded-md flex-row items-center justify-center gap-1.5"
            >
              <Sun
                size={14}
                color={mode === "light" ? colors.brand2 : colors.text3}
              />
              <Text
                style={{
                  color: mode === "light" ? colors.brand2 : colors.text3,
                  fontSize: 12,
                  fontWeight: mode === "light" ? "700" : "500",
                }}
              >
                Light
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔔 3. Preferences Section */}
        <Text
          style={{ color: colors.text3 }}
          className="text-xs font-bold uppercase tracking-wider mb-2 ml-1"
        >
          Preferences
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border mb-4 overflow-hidden"
        >
          {/* Push Notifications */}
          <View className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View
                style={{ backgroundColor: colors.surface2 }}
                className="w-8 h-8 rounded-lg items-center justify-center"
              >
                <Bell size={16} color={colors.brand2} />
              </View>
              <View>
                <Text style={{ color: colors.text }} className="text-sm font-bold">
                  Push Notifications
                </Text>
                <Text style={{ color: colors.text3 }} className="text-[11px]">
                  Alerts on likes and replies
                </Text>
              </View>
            </View>

            <Switch
              value={pushNotifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.surface3, true: colors.brand }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 📜 4. Legal & About Section */}
        <Text
          style={{ color: colors.text3 }}
          className="text-xs font-bold uppercase tracking-wider mb-2 ml-1"
        >
          About & Legal
        </Text>
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-xl border mb-5 overflow-hidden"
        >
          {/* Privacy Policy */}
          <TouchableOpacity
            onPress={() => router.push("/(public)/privacy" as any)}
            activeOpacity={0.7}
            className="p-4 flex-row items-center justify-between border-b border-border/40"
          >
            <View className="flex-row items-center gap-3">
              <View
                style={{ backgroundColor: colors.surface2 }}
                className="w-8 h-8 rounded-lg items-center justify-center"
              >
                <Shield size={16} color={colors.brand2} />
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-semibold">
                Privacy Policy
              </Text>
            </View>
            <ChevronRight size={16} color={colors.text3} />
          </TouchableOpacity>

          {/* Terms of Service */}
          <TouchableOpacity
            onPress={() => router.push("/(public)/terms" as any)}
            activeOpacity={0.7}
            className="p-4 flex-row items-center justify-between border-b border-border/40"
          >
            <View className="flex-row items-center gap-3">
              <View
                style={{ backgroundColor: colors.surface2 }}
                className="w-8 h-8 rounded-lg items-center justify-center"
              >
                <FileText size={16} color={colors.brand2} />
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-semibold">
                Terms of Service
              </Text>
            </View>
            <ChevronRight size={16} color={colors.text3} />
          </TouchableOpacity>

          {/* App Version Info */}
          <View className="p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View
                style={{ backgroundColor: colors.surface2 }}
                className="w-8 h-8 rounded-lg items-center justify-center"
              >
                <Sparkles size={16} color={colors.brand2} />
              </View>
              <Text style={{ color: colors.text }} className="text-sm font-semibold">
                Version
              </Text>
            </View>
            <Text style={{ color: colors.text3 }} className="text-xs font-bold">
              v1.0.0 (Production)
            </Text>
          </View>
        </View>

        {/* 🚪 5. Logout CTA Button */}
        <TouchableOpacity
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
          style={{
            backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.08)",
            borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)",
          }}
          className="py-4 rounded-lg border flex-row items-center justify-center gap-2 mb-6"
        >
          <LogOut size={17} color="#EF4444" />
          <Text style={{ color: "#EF4444" }} className="text-sm font-bold">
            Sign Out of Account
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 🔴 Logout Confirmation Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
}
