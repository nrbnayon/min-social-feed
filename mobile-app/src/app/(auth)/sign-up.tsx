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
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react-native";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { register } = useAuth();
  const showToast = useToastStore((s) => s.showToast);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        username: username.trim().toLowerCase().replace(/\s+/g, "_"),
        email: email.trim(),
        password,
      });
      showToast(`Welcome, ${name}! 🎉`, "🎉");
      router.replace("/(protected)");
    } catch (e: any) {
      setError(e?.message || "Registration failed. Please try again.");
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
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5"
      >
        <View className="w-full max-w-sm mx-auto justify-center">
          {/* App Logo & Branding */}
          <View className="items-center mb-5">
            <Image
              source={require("@/assets/images/app-logo.png")}
              className="w-14 h-14 rounded-2xl mb-2"
              resizeMode="contain"
            />
            <Text className="text-2xl font-extrabold text-foreground tracking-tight">
              MiniSocial
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-surface rounded-3xl p-6 border border-border shadow-2xl mb-4">
            <Text className="text-2xl font-bold text-foreground tracking-tight">
              Create an account
            </Text>
            <Text className="text-sm text-textSecondary mt-1 mb-4">
              Join the conversation with creators
            </Text>

            {/* Error Message */}
            {error ? (
              <View className="bg-pink/10 border border-pink/30 rounded-xl p-3 mb-3">
                <Text className="text-xs font-semibold text-pink text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Full Name */}
            <View className="mb-3">
              <Text className="text-xs font-semibold text-textSecondary mb-1.5">
                Full Name
              </Text>
              <View className="flex-row items-center h-12 px-3.5 rounded-xl bg-surface2 border border-border">
                <User size={18} color={colors.text3} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Alex Morgan"
                  placeholderTextColor={colors.text3}
                  className="flex-1 text-foreground text-sm ml-2.5 h-full"
                />
              </View>
            </View>

            {/* Username */}
            <View className="mb-3">
              <Text className="text-xs font-semibold text-textSecondary mb-1.5">
                Username
              </Text>
              <View className="flex-row items-center h-12 px-3.5 rounded-xl bg-surface2 border border-border">
                <AtSign size={18} color={colors.text3} />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="e.g. alex_design"
                  placeholderTextColor={colors.text3}
                  autoCapitalize="none"
                  className="flex-1 text-foreground text-sm ml-2.5 h-full"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-3">
              <Text className="text-xs font-semibold text-textSecondary mb-1.5">
                Email Address
              </Text>
              <View className="flex-row items-center h-12 px-3.5 rounded-xl bg-surface2 border border-border">
                <Mail size={18} color={colors.text3} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="alex@example.com"
                  placeholderTextColor={colors.text3}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 text-foreground text-sm ml-2.5 h-full"
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-textSecondary mb-1.5">
                Password
              </Text>
              <View className="flex-row items-center h-12 px-3.5 rounded-xl bg-surface2 border border-border">
                <Lock size={18} color={colors.text3} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimum 6 characters"
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
              onPress={handleSignUp}
              disabled={loading}
              className="w-full rounded-xl overflow-hidden active:opacity-90 active:scale-[0.99] mb-3"
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
                    Create Account
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Terms & Privacy Links */}
            <View className="flex-row flex-wrap justify-center items-center">
              <Text className="text-[11px] text-textSecondary text-center leading-4">
                By signing up, you agree to our{" "}
              </Text>
              <Link href="/(public)/terms" asChild>
                <Pressable>
                  <Text className="text-[11px] font-bold text-brand2">
                    Terms
                  </Text>
                </Pressable>
              </Link>
              <Text className="text-[11px] text-textSecondary"> and </Text>
              <Link href="/(public)/privacy" asChild>
                <Pressable>
                  <Text className="text-[11px] font-bold text-brand2">
                    Privacy Policy
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center gap-1">
            <Text className="text-sm text-textSecondary">
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable className="py-1 px-1">
                <Text className="text-sm font-bold text-brand2">
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
