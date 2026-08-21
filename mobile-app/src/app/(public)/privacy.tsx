import React from "react";
import { ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackButton } from "@/components/ui/BackButton";
import { TranslatedText } from "@/components/Shared/TranslatedText";

export default function PrivacyPolicy() {
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
            Privacy Policy
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

            {/* Section 1: Information We Collect */}
            <View className="mb-8">
              <TranslatedText className="text-lg font-bold text-foreground mb-4">
                1. Information We Collect
              </TranslatedText>

              {/* 1.1 Account Information */}
              <View className="mb-6">
                <TranslatedText className="text-base font-bold text-foreground mb-2">
                  1.1 Account Information
                </TranslatedText>
                <TranslatedText className="text-sm text-secondary leading-6 mb-3">
                  When you create an account, we may collect:
                </TranslatedText>
                <View className="gap-2 mb-3">
                  {[
                    "Your name or username",
                    "Email address",
                    "Login credentials",
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
                  This information is used to create and manage your account securely.
                </TranslatedText>
              </View>

              {/* 1.2 Listening and Learning Data */}
              <View className="mb-6">
                <TranslatedText className="text-base font-bold text-foreground mb-2">
                  1.2 Listening and Learning Data
                </TranslatedText>
                <TranslatedText className="text-sm text-secondary leading-6 mb-3">
                  While using the app, we may collect information related to your learning progress, including:
                </TranslatedText>
                <View className="gap-2 mb-3">
                  {[
                    "Completed listening sessions",
                    "Quiz results and scores",
                    "Focus and concentration metrics",
                    "Listening time and activity history",
                    "Achievement badges and progress statistics",
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
                  This information is used to personalize your experience and track your improvement over time.
                </TranslatedText>
              </View>

              {/* 1.3 Usage Information */}
              <View className="mb-4">
                <TranslatedText className="text-base font-bold text-foreground mb-2">
                  1.3 Usage Information
                </TranslatedText>
                <TranslatedText className="text-sm text-secondary leading-6 mb-3">
                  We may collect limited information about how you use the app, such as:
                </TranslatedText>
                <View className="gap-2 mb-3">
                  {[
                    "Features and lessons accessed",
                    "Session activity and completion status",
                    "Device type and operating system",
                    "App performance and crash reports",
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
                  This information helps us improve the app's functionality, performance, and user experience.
                </TranslatedText>
              </View>
            </View>

            {/* Section 2: Account Deletion & Data Retention */}
            <View className="mb-8">
              <TranslatedText className="text-lg font-bold text-foreground mb-4">
                2. Account Deletion & Data Retention
              </TranslatedText>

              {/* 2.1 How to Delete Your Account */}
              <View className="mb-6">
                <TranslatedText className="text-base font-bold text-foreground mb-2">
                  2.1 In-App Account Deletion
                </TranslatedText>
                <TranslatedText className="text-sm text-secondary leading-6 mb-3">
                  In compliance with Apple App Store Review Guidelines (5.1.1(v)), you have the absolute right to delete your account and associated personal data at any time directly within the app:
                </TranslatedText>
                <View className="gap-2 mb-3">
                  {[
                    "Navigate to Profile > Delete Account (available on iOS)",
                    "Confirm deletion in the permission modal",
                    "Or email our privacy team at privacy@todai.app for manual account removal",
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

              {/* 2.2 Immediate Data Purging */}
              <View className="mb-6">
                <TranslatedText className="text-base font-bold text-foreground mb-2">
                  2.2 Data Purging & Retention
                </TranslatedText>
                <TranslatedText className="text-sm text-secondary leading-6 mb-3">
                  When account deletion is confirmed, the following data is permanently purged from active servers immediately:
                </TranslatedText>
                <View className="gap-2 mb-3">
                  {[
                    "Profile details (name, email, avatar)",
                    "Learning progress, lesson completion & XP history",
                    "Quiz attempts, scores & achievement badges",
                    "Saved articles, daily feed preferences & notification tokens",
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
                  Encrypted backups and temporary system logs are fully erased within 30 days. We do not retain or monetize deleted user data.
                </TranslatedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
