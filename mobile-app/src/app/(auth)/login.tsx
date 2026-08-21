import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
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
import {
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react-native";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { login, loginDemo } = useAuth();
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState("jordan@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email.");
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
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5"
      >
        <View className="w-full max-w-sm mx-auto justify-center">
          {/* App Logo & Branding */}
          <View className="items-center mb-6">
            <Image
              source={require("@/assets/images/app-logo.png")}
              className="w-16 h-16 rounded-2xl mb-2"
              resizeMode="contain"
            />
            <Text className="text-3xl font-extrabold text-foreground tracking-tight">
              MiniSocial
            </Text>
            <Text className="text-sm font-medium text-textSecondary mt-1">
              Connect • Share • Discover
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-surface rounded-3xl p-6 border border-border shadow-2xl mb-6">
            <Text className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back
            </Text>
            <Text className="text-sm text-textSecondary mt-1 mb-5">
              Sign in to continue to your social feed
            </Text>

            {/* Error Message */}
            {error ? (
              <View className="bg-pink/10 border border-pink/30 rounded-md p-3 mb-4">
                <Text className="text-xs font-semibold text-pink text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-textSecondary mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center h-12 px-3.5 rounded-md bg-surface2 border border-border">
                <Mail size={18} color={colors.text3} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.text3}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 text-foreground text-sm ml-2.5 h-full"
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="text-xs font-semibold text-textSecondary mb-2">
                Password
              </Text>
              <View className="flex-row items-center h-12 px-3.5 rounded-md bg-surface2 border border-border">
                <Lock size={18} color={colors.text3} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text3}
                  secureTextEntry={!showPassword}
                  className="flex-1 text-foreground text-sm ml-2.5 h-full"
                />
                <Pressable
                  onPress={() => setShowPassword((s) => !s)}
                  className="p-1"
                  hitSlop={8}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.text3} />
                  ) : (
                    <Eye size={18} color={colors.text3} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading || demoLoading}
              className="w-full rounded-md overflow-hidden active:opacity-90 active:scale-[0.99]"
            >
              <LinearGradient
                colors={Gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-12 items-center justify-center px-4"
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Sign In
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Demo Quick Login */}
            <Pressable
              onPress={handleDemoLogin}
              disabled={loading || demoLoading}
              className="flex-row items-center justify-center gap-2 h-12 rounded-md bg-surface2 border border-border mt-3 active:opacity-80"
            >
              {demoLoading ? (
                <ActivityIndicator color={colors.brand2} size="small" />
              ) : (
                <>
                  <Sparkles size={16} color={colors.brand2} />
                  <Text className="text-sm font-semibold text-foreground">
                    Try Demo Account
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center gap-1">
            <Text className="text-sm text-textSecondary">
              Don't have an account?
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable className="py-1 px-1">
                <Text className="text-sm font-bold text-brand2">
                  Sign up
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
