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
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
      >
        <View className="w-full max-w-md mx-auto">
          {/* Header & Logo */}
          <View className="items-center mb-6">
            <Image
              source={require("@/assets/images/app-logo.png")}
              style={{ width: 64, height: 64, borderRadius: 14 }}
              className="mb-3 shadow-lg shadow-indigo-500/30"
              resizeMode="contain"
            />
            <Text className="text-3xl font-black text-foreground tracking-tight text-center">
              Create account
            </Text>
            <Text className="text-base text-textSecondary mt-1.5 text-center">
              Join the conversation on MiniSocial
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-pink/10 border border-pink/30 rounded-md p-3.5 mb-4">
              <Text className="text-sm font-semibold text-pink text-center">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View className="mb-4">
            {/* Full Name */}
            <View className="mb-3.5">
              <Text className="text-sm font-semibold text-textSecondary mb-1.5 ml-1">
                Full Name
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
                <User size={19} color={colors.text3} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Alex Morgan"
                  placeholderTextColor={colors.text3}
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

            {/* Username */}
            <View className="mb-3.5">
              <Text className="text-sm font-semibold text-textSecondary mb-1.5 ml-1">
                Username
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
                <AtSign size={19} color={colors.text3} />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="e.g. alex_design"
                  placeholderTextColor={colors.text3}
                  autoCapitalize="none"
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

            {/* Email */}
            <View className="mb-3.5">
              <Text className="text-sm font-semibold text-textSecondary mb-1.5 ml-1">
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
                  placeholder="alex@example.com"
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

            {/* Password */}
            <View className="mb-2">
              <Text className="text-sm font-semibold text-textSecondary mb-1.5 ml-1">
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
                  placeholder="Minimum 6 characters"
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

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
            style={{ height: 50, overflow: "hidden" }}
            className="w-full shadow-md shadow-indigo-500/25 mb-4 rounded-lg"
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
                  Create Account
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Terms & Privacy */}
          <View className="flex-row flex-wrap justify-center items-center mb-6 px-2">
            <Text className="text-xs text-textSecondary text-center leading-5">
              By continuing, you agree to our{" "}
            </Text>
            <Link href="/(public)/terms" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-xs font-bold text-brand2">
                  Terms
                </Text>
              </TouchableOpacity>
            </Link>
            <Text className="text-xs text-textSecondary"> and </Text>
            <Link href="/(public)/privacy" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-xs font-bold text-brand2">
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center gap-1.5">
            <Text className="text-base text-textSecondary">
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity activeOpacity={0.7} className="py-1 px-1">
                <Text className="text-base font-bold text-brand2">
                  Sign in
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
