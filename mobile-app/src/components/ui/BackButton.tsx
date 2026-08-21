import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { ChevronLeft } from "lucide-react-native";

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress || (() => router.back())}
      style={[
        styles.btn,
        {
          backgroundColor: colors.surface2,
          borderColor: colors.border,
        },
      ]}
      hitSlop={8}
    >
      <ChevronLeft size={20} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BackButton;
