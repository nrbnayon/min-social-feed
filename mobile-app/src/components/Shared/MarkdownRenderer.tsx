import React from "react";
import { View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useAppTheme } from "@/context/ThemeContext";

interface MarkdownRendererProps {
  content?: string | string[];
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { theme } = useAppTheme();
  const isDark = theme === "dark";

  const rawText = Array.isArray(content) ? content.join("\n\n") : (content || "");

  const markdownStyles = {
    body: {
      color: isDark ? "#A8A29E" : "#78716C",
      fontSize: 15,
      lineHeight: 24,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    heading1: {
      color: isDark ? "#F5F5F4" : "#1C1917",
      fontSize: 24,
      lineHeight: 32,
      fontFamily: "PlusJakartaSans_700Bold",
      marginTop: 12,
      marginBottom: 8,
    },
    heading2: {
      color: isDark ? "#F5F5F4" : "#1C1917",
      fontSize: 20,
      lineHeight: 28,
      fontFamily: "PlusJakartaSans_700Bold",
      marginTop: 10,
      marginBottom: 6,
    },
    heading3: {
      color: "#0F766E",
      fontSize: 17,
      lineHeight: 24,
      fontFamily: "PlusJakartaSans_700Bold",
      marginTop: 8,
      marginBottom: 4,
    },
    strong: {
      fontFamily: "PlusJakartaSans_700Bold",
      color: isDark ? "#F5F5F4" : "#0D0D0D",
    },
    em: {
      fontStyle: "italic" as const,
    },
    link: {
      color: "#0F766E",
      textDecorationLine: "underline" as const,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    blockquote: {
      borderLeftColor: "#0F766E",
      borderLeftWidth: 4,
      paddingLeft: 14,
      paddingVertical: 6,
      marginVertical: 10,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F5F7FA",
      borderRadius: 8,
    },
    bullet_list_icon: {
      color: "#0F766E",
      fontSize: 16,
      marginRight: 6,
    },
    code_inline: {
      backgroundColor: isDark ? "#262626" : "#F0FDFA",
      color: "#0F766E",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      fontFamily: "monospace",
    },
    code_block: {
      backgroundColor: isDark ? "#1C1917" : "#F0FDFA",
      borderColor: "rgba(15, 118, 110, 0.3)",
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginVertical: 8,
      color: isDark ? "#F5F5F4" : "#0D0D0D",
      fontFamily: "monospace",
    },
  };

  return (
    <View className="w-full">
      <Markdown style={markdownStyles as any}>{rawText}</Markdown>
    </View>
  );
}
