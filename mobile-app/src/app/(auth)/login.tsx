import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/store/auth.store";
import { useAppTheme } from "@/context/ThemeContext";
import { useToastStore } from "@/store/useToastStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gradients } from "@/constants/theme";
import { MessageSquare, Sparkles } from "lucide-react-native";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { login, loginDemo } = useAuth();
  const showToast = useToastStore((s) => s.showToast);

  const [email, setEmail] = useState("jordan@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
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
      setError(e?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginDemo();
      showToast("Signed in as Jordan Ellis ✨", "✨");
      router.replace("/(protected)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#090A12" : "#F8FAFC" },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Logo Branding */}
          <View style={styles.branding}>
            <LinearGradient
              colors={Gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <MessageSquare size={32} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={[styles.brandTitle, { color: colors.text }]}>
              MiniSocial
            </Text>
            <Text style={[styles.brandTagline, { color: colors.text2 }]}>
              Connect • Share • Discover
            </Text>
          </View>

          {/* Card Form */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Welcome back
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.text2 }]}>
              Sign in to continue to your feed
            </Text>

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(236, 72, 153, 0.12)"
                      : "rgba(236, 72, 153, 0.08)",
                    borderColor: isDark
                      ? "rgba(236, 72, 153, 0.3)"
                      : "rgba(236, 72, 153, 0.2)",
                  },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.pink }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <Button
              variant="gradient"
              size="lg"
              loading={loading}
              onPress={handleLogin}
              style={{ marginTop: 8 }}
            >
              Sign In
            </Button>

            {/* Quick Demo Button */}
            <Pressable
              onPress={handleDemoLogin}
              style={({ pressed }) => [
                styles.demoBtn,
                {
                  backgroundColor: colors.surface2,
                  borderColor: colors.borderStrong,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Sparkles size={16} color={colors.brand2} />
              <Text style={[styles.demoBtnText, { color: colors.text }]}>
                Quick Demo Account
              </Text>
            </Pressable>
          </View>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.text2 }]}>
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <Text style={[styles.linkText, { color: colors.brand2 }]}>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  branding: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  demoBtnText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13.5,
  },
  linkText: {
    fontSize: 13.5,
    fontWeight: "700",
  },
});
