import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Gradients } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: "primary" | "gradient" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = "gradient",
  size = "md",
  loading,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors, isDark } = useAppTheme();
  const isDisabled = loading || disabled;

  const height = size === "sm" ? 36 : size === "lg" ? 52 : 44;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  if (variant === "gradient") {
    return (
      <Pressable
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.btnBase,
          { height, opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1 },
          style as any,
        ]}
        {...props}
      >
        <LinearGradient
          colors={Gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientFill, { borderRadius: 14 }]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : typeof children === "string" ? (
            <Text style={[styles.gradientText, { fontSize }]}>{children}</Text>
          ) : (
            children
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const bgColor =
    variant === "primary"
      ? colors.brand
      : variant === "danger"
      ? colors.pink
      : variant === "outline"
      ? "transparent"
      : "transparent";

  const borderColor =
    variant === "outline" ? colors.borderStrong : "transparent";

  const textColor =
    variant === "outline"
      ? colors.text
      : variant === "ghost"
      ? colors.brand2
      : "#FFFFFF";

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btnBase,
        {
          height,
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === "outline" ? 1 : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style as any,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : typeof children === "string" ? (
        <Text style={[styles.btnText, { color: textColor, fontSize }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btnBase: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradientFill: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  gradientText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  btnText: {
    fontWeight: "700",
  },
});

export default Button;
