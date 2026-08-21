import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
            <View className="bg-pink/10 border border-pink/30 rounded-md p-3.5 mb-5">
              <Text className="text-sm font-semibold text-pink text-center">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View className="mb-6">
            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-textSecondary mb-2 ml-1">
                Email Address
              </Text>
              <View
                style={{
                  height: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                }}
                className="bg-surface border border-border rounded-lg focus:border-brand"
              >
                <Mail size={19} color={colors.text3} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.text3}
                  autoCapitalize="none"
                  keyboardType="email-address"

                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 16,
                    color: colors.text,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingVertical: 0,
                    margin: 0,
                    height: Platform.OS === "ios" ? 44 : "100%",
                    textAlignVertical: "center",
                  }}
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-2">
              <Text className="text-sm font-semibold text-textSecondary mb-2 ml-1">
                Password
              </Text>
              <View
                style={{
                  height: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                }}
                className="bg-surface border border-border rounded-lg focus:border-brand"
              >
                <Lock size={19} color={colors.text3} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text3}
                  secureTextEntry={!showPassword}
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 16,
                    color: colors.text,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingVertical: 0,
                    margin: 0,
                    height: Platform.OS === "ios" ? 44 : "100%",
                    textAlignVertical: "center",
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((s) => !s)}
                  activeOpacity={0.7}
                  className="p-1"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={19} color={colors.text3} />
                  ) : (
                    <Eye size={19} color={colors.text3} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
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
