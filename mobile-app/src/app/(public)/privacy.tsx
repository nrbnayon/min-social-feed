import React from "react";
import { ScrollView, View, Text } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/ui/BackButton";
import { useAppTheme } from "@/context/ThemeContext";

export default function PrivacyPolicy() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 10,
      }}
    >
      {/* Header */}
      <View className="px-5 pb-4 flex-row items-center border-b border-border">
        <BackButton onPress={() => router.back()} />
        <Text className="text-xl font-bold text-foreground ml-4">
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs text-textSecondary mb-5 font-medium">
          Last Updated: March 2026
        </Text>

        {/* Section 1 */}
        <View className="mb-6 bg-surface p-5 rounded-2xl border border-border">
          <Text className="text-base font-bold text-foreground mb-2">
            1. Information We Collect
          </Text>
          <Text className="text-sm text-textSecondary leading-6 mb-2">
            When you use MiniSocial, we collect information you provide directly to us:
          </Text>
          <Text className="text-sm text-textSecondary leading-6">
            • Account details: your name, username, email, and avatar.{"\n"}
            • Content: posts, comments, likes, bookmarks, and stories you share.{"\n"}
            • Communications: notifications and feedback.
          </Text>
        </View>

        {/* Section 2 */}
        <View className="mb-6 bg-surface p-5 rounded-2xl border border-border">
          <Text className="text-base font-bold text-foreground mb-2">
            2. How We Use Your Data
          </Text>
          <Text className="text-sm text-textSecondary leading-6">
            We use your information to operate and personalize your social feed, enable real-time notifications for likes and replies, secure your account, and improve our services.
          </Text>
        </View>

        {/* Section 3 */}
        <View className="mb-6 bg-surface p-5 rounded-2xl border border-border">
          <Text className="text-base font-bold text-foreground mb-2">
            3. Sharing & Public Profile
          </Text>
          <Text className="text-sm text-textSecondary leading-6">
            Your profile name, username, avatar, and published posts are visible to other users on the public feed. You can edit or delete your posts anytime. We do not sell your personal data to third parties.
          </Text>
        </View>

        {/* Section 4 */}
        <View className="mb-6 bg-surface p-5 rounded-2xl border border-border">
          <Text className="text-base font-bold text-foreground mb-2">
            4. Security & Storage
          </Text>
          <Text className="text-sm text-textSecondary leading-6">
            We use industry-standard encryption to protect your credentials and personal information. You can request account deletion at any time by contacting support.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
