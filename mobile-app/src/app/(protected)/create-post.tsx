import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { Avatar } from "@/components/Shared/Avatar";
import { Gradients } from "@/constants/theme";
import { X, Send } from "lucide-react-native";

const MAX_CHARS = 280;

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { createPost } = usePostsStore();
  const currentUser = useAuth((s) => s.user);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      await createPost(
        content.trim(),
        [], // No tags
        undefined,
        currentUser
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const isOverLimit = content.length > MAX_CHARS;
  const isNearLimit = content.length > 250;
  const canPublish = content.trim().length > 0 && !loading && !isOverLimit;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {/* 🌟 Top Header with Back & Publish Button */}
      <View
        style={{
          paddingTop: insets.top + (Platform.OS === "ios" ? 8 : 12),
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "rgba(9, 10, 18, 0.95)" : "rgba(248, 250, 252, 0.95)",
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        }}
        className="flex-row items-center justify-between"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="p-1.5 -ml-1.5"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={22} color={colors.text} />
        </TouchableOpacity>

        <Text
          style={{ color: colors.text }}
          className="text-base font-bold tracking-tight"
        >
          New Post
        </Text>

        {/* Top Header Publish Button */}
        <TouchableOpacity
          onPress={handlePublish}
          disabled={!canPublish}
          activeOpacity={0.85}
          style={{
            opacity: canPublish ? 1 : 0.4,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  Publish
                </Text>
                <Send size={12} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 📝 Editor Body */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 18,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Author Header Row */}
        <View className="flex-row items-center mb-4">
          <Avatar
            src={currentUser?.avatar}
            size={44}
            gradientBorder={true}
            name={currentUser?.name || "You"}
          />
          <View className="ml-3">
            <Text
              style={{ color: colors.text }}
              className="text-base font-bold"
            >
              {currentUser?.name || "Jordan Ellis"}
            </Text>
            <Text
              style={{ color: colors.text3 }}
              className="text-xs mt-0.5"
            >
              @{currentUser?.username || "jordan"} • Public update
            </Text>
          </View>
        </View>

        {/* Text Input Box */}
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="What's happening? Share what's on your mind..."
          placeholderTextColor={colors.text3}
          multiline
          autoFocus
          maxLength={MAX_CHARS}
          style={{
            color: colors.text,
            fontSize: 17,
            lineHeight: 25,
            minHeight: 180,
            textAlignVertical: "top",
          }}
        />
      </ScrollView>

      {/* 📊 Bottom Action Bar (Always visible at bottom & pinned above keyboard) */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 10,
          paddingHorizontal: 16,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        }}
        className="flex-row items-center justify-between"
      >
        {/* Character Counter (e.g. 0 / 280) */}
        <Text
          style={{
            color: isOverLimit
              ? colors.pink
              : isNearLimit
              ? colors.yellow
              : colors.text3,
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          {content.length} / {MAX_CHARS}
        </Text>

        {/* Bottom Right Post Button */}
        <TouchableOpacity
          onPress={handlePublish}
          disabled={!canPublish}
          activeOpacity={0.85}
          style={{
            opacity: canPublish ? 1 : 0.4,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 9,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  Post
                </Text>
                <Send size={14} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
