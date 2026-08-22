import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/context/ThemeContext";
import { useCreatePostMutation } from "@/hooks/usePostsQuery";
import { useAuth } from "@/store/auth.store";
import { Avatar } from "@/components/Shared/Avatar";
import { Gradients } from "@/constants/theme";
import { X, Send } from "lucide-react-native";

const MAX_CHARS = 1000;

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const createPostMutation = useCreatePostMutation();
  const currentUser = useAuth((s) => s.user);

  const [content, setContent] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Hardware-accelerated real-time keyboard tracking on both iOS and Android
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
  });

  const animatedBottomStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -keyboard.height.value }],
    };
  });

  // Auto-focus and open keyboard whenever user opens or returns to Create Post
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      return () => clearTimeout(timer);
    }, [])
  );

  // Clear form whenever screen loses focus or user navigates away after publishing
  const handleClose = () => {
    setContent("");
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)");
    }
  };

  const handlePublish = async () => {
    if (!content.trim() || createPostMutation.isPending) return;
    const textToPublish = content.trim();
    try {
      await createPostMutation.mutateAsync(textToPublish);
      setContent(""); // Clear input form on success
      handleClose();
    } catch {
      // Error toast handled inside mutation
    }
  };

  const isOverLimit = content.length > MAX_CHARS;
  const isNearLimit = content.length > 900;
  const canPublish = content.trim().length > 0 && !createPostMutation.isPending && !isOverLimit;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 1. Top Header with Back & Top Publish Button */}
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
          onPress={handleClose}
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
            {createPostMutation.isPending ? (
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

      {/* 2. Editor Body */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 18,
          paddingBottom: 40,
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
              {currentUser?.name || "User"}
            </Text>
            <Text
              style={{ color: colors.text3 }}
              className="text-xs mt-0.5"
            >
              @{currentUser?.username || "user"} • Public
            </Text>
          </View>
        </View>

        {/* Text Input Box with Auto-Focus Ref */}
        <TextInput
          ref={inputRef}
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

      {/* 3. Bottom Action Bar (Follows Keyboard Smoothly via Reanimated) */}
      <Animated.View
        style={[
          animatedBottomStyle,
          {
            paddingBottom: Math.max(insets.bottom, 14),
            paddingTop: 10,
            paddingHorizontal: 16,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 6,
            elevation: 8,
          },
        ]}
        className="flex-row items-center justify-between"
      >
        {/* Character Counter */}
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

        {/* Bottom Post Button */}
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
              paddingHorizontal: 20,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            {createPostMutation.isPending ? (
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
      </Animated.View>
    </View>
  );
}
