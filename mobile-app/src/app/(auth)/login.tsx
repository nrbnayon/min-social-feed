import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/store/auth.store";
import { useAppTheme } from "@/context/ThemeContext";
import { useToastStore } from "@/store/useToastStore";
import { Gradients } from "@/constants/theme";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Lock,
  Mail,
} from "lucide-react-native";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { login, loginDemo } = useAuth();
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      showToast("Welcome back! 👋", "👋");
      router.replace("/(protected)");
    } catch (e: any) {
      setError(e?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await loginDemo();
      showToast("Signed in as Jordan Ellis ✨", "✨");
      router.replace("/(protected)");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
      >
        <View className="w-full max-w-md mx-auto">
          {/* Header & App Logo */}
          <View className="items-center mb-8">
            <Image
              source={require("@/assets/images/app-logo.png")}
              style={{ width: 72, height: 72, borderRadius: 16 }}
              className="mb-4 shadow-lg shadow-indigo-500/30"
              resizeMode="contain"
            />
            <Text className="text-3xl font-black text-foreground tracking-tight text-center">
              Welcome back
            </Text>
            <Text className="text-base text-textSecondary mt-2 text-center">
              Sign in to continue to MiniSocial
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-pink/10 border border-pink/30 rounded-lg p-3.5 mb-5">
              <Text className="text-sm font-semibold text-pink text-center">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Form Fields using Reusable Input */}
          <View className="mb-2">
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Mail size={19} color={colors.text3} />}
              containerClassName="mb-4"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              isPassword
              leftIcon={<Lock size={19} color={colors.text3} />}
              containerClassName="mb-2"
            />
          </View>

          {/* Sign In CTA Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || demoLoading}
            activeOpacity={0.85}
            style={{ height: 50, overflow: "hidden" }}
            className="w-full shadow-md shadow-indigo-500/25 mb-3.5 rounded-lg"
          >
            <LinearGradient
              colors={Gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-bold text-base tracking-wide">
                  Sign In
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Demo Account Button */}
          <TouchableOpacity
            onPress={handleDemoLogin}
            disabled={loading || demoLoading}
            activeOpacity={0.8}
            style={{ height: 50 }}
            className="flex-row items-center justify-center gap-2 bg-surface border border-border mb-8 rounded-lg"
          >
            {demoLoading ? (
              <ActivityIndicator color={colors.brand2} size="small" />
            ) : (
              <>
                <Sparkles size={18} color={colors.brand2} />
                <Text className="text-base font-semibold text-foreground">
                  Try Demo Account
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center gap-1.5">
            <Text className="text-base text-textSecondary">
              Don't have an account?
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity activeOpacity={0.7} className="py-1 px-1">
                <Text className="text-base font-bold text-brand2">
                  Sign up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
