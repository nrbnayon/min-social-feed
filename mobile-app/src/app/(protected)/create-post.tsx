import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { Avatar } from "@/components/Shared/Avatar";
import { Button } from "@/components/ui/button";
import {
  X,
  Image as ImageIcon,
  Tag,
  Sparkles,
  Smile,
} from "lucide-react-native";

const POPULAR_TAGS = [
  "Tech",
  "Design",
  "AI",
  "OpenSource",
  "Startup",
  "DevTools",
  "Photography",
];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=350&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=350&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1603145733146-ae562a55031e?w=600&h=350&fit=crop&auto=format",
];

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { createPost } = usePostsStore();
  const currentUser = useAuth((s) => s.user);

  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["DevTools"]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const MAX_CHARS = 280;

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAttachRandomImage = () => {
    if (selectedImage) {
      setSelectedImage(null);
    } else {
      const randomImg = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
      setSelectedImage(randomImg);
    }
  };

  const handlePublish = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      await createPost(
        content.trim(),
        selectedTags,
        selectedImage || undefined,
        currentUser
      );
      router.back();
    } catch {
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
      {/* Top Navigation Bar */}
      <View
        style={[
          styles.navBar,
          {
            paddingTop: insets.top + (Platform.OS === "ios" ? 6 : 12),
            backgroundColor: isDark ? "#090A12" : "#F8FAFC",
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
          hitSlop={8}
        >
          <X size={18} color={colors.text} />
        </Pressable>

        <Text style={[styles.navTitle, { color: colors.text }]}>
          Create Post
        </Text>

        <Button
          variant="gradient"
          size="sm"
          loading={loading}
          disabled={!content.trim()}
          onPress={handlePublish}
        >
          Publish
        </Button>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Author Header */}
        <View style={styles.authorRow}>
          <Avatar
            src={currentUser?.avatar}
            size={44}
            name={currentUser?.name}
            verified={currentUser?.verified}
          />
          <View>
            <Text style={[styles.authorName, { color: colors.text }]}>
              {currentUser?.name || "User"}
            </Text>
            <Text style={[styles.authorUsername, { color: colors.text3 }]}>
              @{currentUser?.username || "user"} • Public
            </Text>
          </View>
        </View>

        {/* Text Input */}
        <TextInput
          value={content}
          onChangeText={setContent}
          maxLength={MAX_CHARS}
          multiline
          autoFocus
          placeholder="What's on your mind? Share your thoughts, discoveries, or ask a question..."
          placeholderTextColor={colors.text3}
          style={[styles.textInput, { color: colors.text }]}
        />

        {/* Attached Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <Pressable
              onPress={() => setSelectedImage(null)}
              style={styles.removeImageBtn}
            >
              <X size={16} color="#FFF" />
            </Pressable>
          </View>
        )}

        {/* Tags Selector */}
        <View style={styles.tagsSection}>
          <View style={styles.tagsHeader}>
            <Tag size={15} color={colors.brand2} />
            <Text style={[styles.tagsTitle, { color: colors.text2 }]}>
              Add Topic Tags
            </Text>
          </View>

          <View style={styles.tagPillsRow}>
            {POPULAR_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => handleToggleTag(tag)}
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? "rgba(99, 102, 241, 0.25)"
                          : "rgba(99, 102, 241, 0.15)"
                        : colors.surface2,
                      borderColor: isSelected
                        ? colors.brand
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagPillText,
                      {
                        color: isSelected ? colors.brand2 : colors.text2,
                        fontWeight: isSelected ? "700" : "500",
                      },
                    ]}
                  >
                    #{tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Tool Strip */}
      <View
        style={[
          styles.bottomTools,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.toolIconRow}>
          <Pressable
            onPress={handleAttachRandomImage}
            style={[
              styles.toolBtn,
              { backgroundColor: selectedImage ? colors.brand : colors.surface2 },
            ]}
          >
            <ImageIcon size={19} color={selectedImage ? "#FFF" : colors.brand2} />
          </Pressable>

          <Pressable style={[styles.toolBtn, { backgroundColor: colors.surface2 }]}>
            <Sparkles size={19} color={colors.brand2} />
          </Pressable>

          <Pressable style={[styles.toolBtn, { backgroundColor: colors.surface2 }]}>
            <Smile size={19} color={colors.brand2} />
          </Pressable>
        </View>

        <Text
          style={[
            styles.charCounter,
            {
              color:
                content.length > MAX_CHARS * 0.85
                  ? colors.pink
                  : colors.text3,
            },
          ]}
        >
          {MAX_CHARS - content.length}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
  },
  authorUsername: {
    fontSize: 12,
    marginTop: 2,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 140,
    textAlignVertical: "top",
  },
  imagePreviewContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 14,
    height: 200,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  tagsSection: {
    marginTop: 24,
  },
  tagsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  tagsTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  tagPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagPillText: {
    fontSize: 12,
  },
  bottomTools: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  toolIconRow: {
    flexDirection: "row",
    gap: 10,
  },
  toolBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  charCounter: {
    fontSize: 13,
    fontWeight: "700",
  },
});
