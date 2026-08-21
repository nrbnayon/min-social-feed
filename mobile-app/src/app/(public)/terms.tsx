import React from "react";
import { ScrollView, View, Text } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/ui/BackButton";
import { useAppTheme } from "@/context/ThemeContext";

export default function TermsAndConditions() {
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
          Terms & Conditions
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
            1. Acceptance of Terms
          </Text>
          <Text className="text-sm text-textSecondary leading-6">
            By creating an account or using the MiniSocial application, you agree to comply with these terms. If you do not agree, please do not use the app.
          </Text>
        </View>

        {/* Section 2 */}
        <View className="mb-6 bg-surface p-5 rounded-2xl border border-border">
          <Text className="text-base font-bold text-foreground mb-2">
            2. Community Guidelines & Content
          </Text>
          <Text className="text-sm text-textSecondary leading-6 mb-2">
            You retain ownership of the content you publish. However, you agree not to post:
          </Text>
          <Text className="text-sm text-textSecondary leading-6">
            • Hate speech, harassment, or abusive behavior.{"\n"}
            • Misinformation or illegal material.{"\n"}
            • Spam, malicious links, or unauthorized advertising.
          </Text>
        </View>

        {/* Section 3 */}
        <View className="mb-6 bg-surface p-5 rounded-2xl border border-border">
          <Text className="text-base font-bold text-foreground mb-2">
            3. Account Responsibilities
          </Text>
          <Text className="text-sm text-textSecondary leading-6">
            You are responsible for maintaining the confidentiality of your login credentials. We reserve the right to suspend or terminate accounts that violate our community standards.
          </Text>
        </View>

        {/* Section 4 */}
        <View className="mb-6 bg-surface p-5 rounded-2xl border border-border">
          <Text className="text-base font-bold text-foreground mb-2">
            4. Service Availability
          </Text>
          <Text className="text-sm text-textSecondary leading-6">
            MiniSocial is provided "as is". We continuously work to improve performance, uptime, and features, and may update features periodically.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
