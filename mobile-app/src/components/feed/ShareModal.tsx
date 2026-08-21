import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Share as NativeShare,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Post } from "@/types";
import { useAppTheme } from "@/context/ThemeContext";
import { useToastStore } from "@/store/useToastStore";
import { usePostsStore } from "@/hooks/usePosts";
import {
  Copy,
  Share,
  Bookmark,
  Repeat,
  Send,
  X,
} from "lucide-react-native";

interface ShareModalProps {
  post: Post | null;
  onClose: () => void;
}

export function ShareModal({ post, onClose }: ShareModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const showToast = useToastStore((s) => s.showToast);
  const { toggleBookmark, sharePost } = usePostsStore();

  if (!post) return null;

  const postId = post.id || post._id || "";

  const handleCopyLink = () => {
    onClose();
    showToast("Link copied to clipboard!", "🔗");
  };

  const handleNativeShare = async () => {
    onClose();
    sharePost(postId);
    try {
      await NativeShare.share({
        message: `${post.content}\n\nShared from MiniSocial by @${post.username || "user"}`,
      });
    } catch {}
  };

  const handleBookmarkAction = () => {
    onClose();
    toggleBookmark(postId);
  };

  const handleRepostAction = () => {
    onClose();
    sharePost(postId);
    showToast("Reposted to your profile! 🔁", "🔁");
  };

  const actions = [
    { label: "Copy Link", icon: Copy, onPress: handleCopyLink },
    { label: "Share via...", icon: Share, onPress: handleNativeShare },
    { label: "Repost", icon: Repeat, onPress: handleRepostAction },
    { label: "Save Post", icon: Bookmark, onPress: handleBookmarkAction },
  ];

  return (
    <Modal
      visible={Boolean(post)}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {/* Grab Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Share Post
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X size={20} color={colors.text2} />
            </Pressable>
          </View>

          {/* Post Snippet */}
          <View
            style={[
              styles.snippetBox,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.snippetAuthor, { color: colors.brand2 }]}>
              @{post.username || "user"}
            </Text>
            <Text style={[styles.snippetText, { color: colors.text }]} numberOfLines={2}>
              {post.content}
            </Text>
          </View>

          {/* Action Grid */}
          <View style={styles.grid}>
            {actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Pressable
                  key={index}
                  onPress={action.onPress}
                  style={({ pressed }) => [
                    styles.actionCard,
                    {
                      backgroundColor: colors.surface2,
                      borderColor: colors.border,
                    },
                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isDark
                          ? "rgba(99, 102, 241, 0.15)"
                          : "rgba(99, 102, 241, 0.1)",
                      },
                    ]}
                  >
                    <IconComponent size={22} color={colors.brand} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  snippetBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  snippetAuthor: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  snippetText: {
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ShareModal;
