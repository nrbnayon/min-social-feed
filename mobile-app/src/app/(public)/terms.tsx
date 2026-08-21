import React from "react";
import { ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/ui/BackButton";
import { TranslatedText } from "@/components/Shared/TranslatedText";

export default function TermsAndConditions() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#BEE3FF", "#FFFFFF", "#FFFFFF"]}
      locations={[0, 0.238, 0.9525]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.45, y: 1 }}
      className="flex-1"
      style={{ flex: 1 }}
    >
      <StatusBar style="auto" />
      <View style={{ flex: 1, paddingTop: insets.top + 12 }} className="flex-1">
        {/* Header */}
        <View className="px-5 pb-4 flex-row items-center">
          <BackButton onPress={() => router.back()} />
          <TranslatedText className="text-2xl font-bold text-primary ml-4">
            Terms and Conditions
          </TranslatedText>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-4">
            <TranslatedText className="text-xs text-secondary mb-6 font-medium">
              Last Updated: July 2026
            </TranslatedText>

            {/* Section 1: Acceptance of Terms */}
            <View className="mb-8">
              <TranslatedText className="text-base font-bold text-foreground mb-2">
                1. Acceptance of Terms
              </TranslatedText>
              <TranslatedText className="text-sm text-secondary leading-6">
                By creating an account and using the application, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, please do not use the app.
              </TranslatedText>
            </View>

            {/* Section 2: User Accounts */}
            <View className="mb-8">
              <TranslatedText className="text-base font-bold text-foreground mb-2">
                2. User Accounts
              </TranslatedText>
              <TranslatedText className="text-sm text-secondary leading-6 mb-3">
                To access certain features of the app, you may be required to create an account. You are responsible for:
              </TranslatedText>
              <View className="gap-2 mb-3">
                {[
                  "Providing accurate and up-to-date information.",
                  "Maintaining the confidentiality of your login credentials.",
                  "All activities that occur under your account.",
                ].map((item, idx) => (
                  <View key={idx} className="flex-row items-start ml-2">
                    <TranslatedText className="text-sm text-primary leading-6 mr-2">•</TranslatedText>
                    <TranslatedText className="text-sm text-secondary leading-6 flex-1">
                      {item}
                    </TranslatedText>
                  </View>
                ))}
              </View>
              <TranslatedText className="text-sm text-secondary leading-6">
                You are responsible for keeping your account information secure and notifying us immediately of any unauthorized use.
              </TranslatedText>
            </View>

                {/* Section 3: Use of the Application */}
            <View className="mb-8">
              <TranslatedText className="text-base font-bold text-foreground mb-2">
                3. Use of the Application
              </TranslatedText>
              <TranslatedText className="text-sm text-secondary leading-6 mb-3">
                The app is designed to help users improve their focus, concentration, active listening, and memory skills through interactive listening exercises and quizzes.
              </TranslatedText>
              <TranslatedText className="text-sm font-semibold text-foreground mb-2">
                By using the app, you agree to:
              </TranslatedText>
              <View className="gap-2">
                {[
                  "Use the application only for lawful purposes.",
                  "Not misuse or attempt to interfere with the app's functionality.",
                  "Not copy, distribute, or modify any content without permission.",
                  "Respect the intellectual property rights associated with the application.",
                ].map((item, idx) => (
                  <View key={idx} className="flex-row items-start ml-2">
                    <TranslatedText className="text-sm text-primary leading-6 mr-2">•</TranslatedText>
                    <TranslatedText className="text-sm text-secondary leading-6 flex-1">
                      {item}
                    </TranslatedText>
                  </View>
                ))}
              </View>
            </View>

            {/* Section 4: Account Termination & Deletion */}
            <View className="mb-8">
              <TranslatedText className="text-base font-bold text-foreground mb-2">
                4. Account Termination & Deletion
              </TranslatedText>
              <TranslatedText className="text-sm text-secondary leading-6 mb-3">
                You retain complete control over your account and data. In accordance with Apple App Store policies:
              </TranslatedText>
              <View className="gap-2 mb-3">
                {[
                  "You may initiate account deletion at any time in-app via Profile > Delete Account (on iOS devices).",
                  "You may also submit a written account deletion request to support@todai.app.",
                  "Upon deletion, your access to all app features, saved data, and learning progress is permanently terminated.",
                ].map((item, idx) => (
                  <View key={idx} className="flex-row items-start ml-2">
                    <TranslatedText className="text-sm text-primary leading-6 mr-2">•</TranslatedText>
                    <TranslatedText className="text-sm text-secondary leading-6 flex-1">
                      {item}
                    </TranslatedText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
