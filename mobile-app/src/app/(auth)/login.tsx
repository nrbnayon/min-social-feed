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
import { appShadow, extractErrorMessage } from "@/lib/utils";
import {
  Lock,
  Mail,
} from "lucide-react-native";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { login } = useAuth();
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      showToast("Welcome back! 👋", "👋");
      router.replace("/(protected)");
    } catch (e: any) {
      const msg = extractErrorMessage(e, "Invalid email or password. Please try again.");
      setError(msg);
    } finally {
      setLoading(false);
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
              source={require("@/assets/icons/appIcon.png")}
              style={{ width: 100, height: 100, borderRadius: 16 }}
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
            <View
              style={{
                backgroundColor: isDark ? "rgba(244, 63, 94, 0.15)" : "#FFF1F2",
                borderColor: colors.pink,
              }}
              className="border rounded-xl p-3.5 mb-5 flex-row items-center gap-2.5"
            >
              <Text
                style={{ color: colors.pink }}
                className="text-sm font-semibold flex-1 text-center"
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* Form Fields */}
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
            disabled={loading}
            activeOpacity={0.85}
            style={{ height: 50, overflow: "hidden" }}
            className={`w-full ${appShadow} mb-8 rounded-lg`}
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
