import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { PostCard } from "@/components/feed/PostCard";
import { Avatar } from "@/components/Shared/Avatar";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShareModal } from "@/components/feed/ShareModal";
import type { Post, Comment } from "@/types";
import { Send, Heart } from "lucide-react-native";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { posts, addComment } = usePostsStore();
  const currentUser = useAuth((s) => s.user);

  const [commentText, setCommentText] = useState("");
  const [sharePost, setSharePost] = useState<Post | null>(null);

  const post = posts.find((p) => (p.id || p._id) === id);

  const handleSendComment = () => {
    if (!commentText.trim() || !id) return;
    addComment(id, commentText.trim(), currentUser);
    setCommentText("");
  };

  if (!post) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: isDark ? "#090A12" : "#F8FAFC" },
        ]}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <BackButton />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Post</Text>
          <View style={{ width: 38 }} />
        </View>
        <EmptyState
          icon="🔍"
          title="Post not found"
          description="This post may have been deleted or does not exist."
        />
      </View>
    );
  }

  const comments = post.comments || [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#090A12" : "#F8FAFC" },
      ]}
    >
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "ios" ? 4 : 10),
            backgroundColor: isDark ? "rgba(9, 10, 18, 0.95)" : "rgba(248, 250, 252, 0.95)",
            borderBottomColor: colors.border,
          },
        ]}
      >
        <BackButton />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Post
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Main Post + Comments List */}
      <FlatList
        data={comments}
        keyExtractor={(item, index) => item.id || item._id || String(index)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.postHeaderContainer}>
            <PostCard
              post={post}
              onSharePress={(p) => setSharePost(p)}
            />
            <View style={[styles.commentsSectionTitle, { borderBottomColor: colors.border }]}>
              <Text style={[styles.commentsCountText, { color: colors.text }]}>
                Comments ({comments.length})
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyComments}>
            <Text style={[styles.emptyText, { color: colors.text3 }]}>
              No comments yet. Share your thoughts! 💬
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.commentItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Avatar
              src={item.avatar || item.author?.avatarUrl}
              size={36}
              name={item.name || item.username || item.author?.username}
            />
            <View style={styles.commentBody}>
              <View style={styles.commentMetaRow}>
                <Text style={[styles.commentUsername, { color: colors.text }]}>
                  @{item.username || item.author?.username || "user"}
                </Text>
                <Text style={[styles.commentTime, { color: colors.text3 }]}>
                  {item.time || "just now"}
                </Text>
              </View>

              <Text style={[styles.commentText, { color: colors.text }]}>
                {item.text || item.content}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Fixed Comment Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <Avatar src={currentUser?.avatar} size={36} name={currentUser?.name} />
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Post your reply..."
          placeholderTextColor={colors.text3}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
        <Pressable
          onPress={handleSendComment}
          disabled={!commentText.trim()}
          style={[
            styles.sendBtn,
            {
              backgroundColor: commentText.trim() ? colors.brand : colors.surface2,
              opacity: commentText.trim() ? 1 : 0.5,
            },
          ]}
        >
          <Send size={16} color={commentText.trim() ? "#FFF" : colors.text3} />
        </Pressable>
      </View>

      <ShareModal
        post={sharePost}
        onClose={() => setSharePost(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  listContent: {
    padding: 14,
    paddingBottom: 80,
  },
  postHeaderContainer: {
    marginBottom: 10,
  },
  commentsSectionTitle: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  commentsCountText: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptyComments: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13.5,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  commentBody: {
    flex: 1,
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: "700",
  },
  commentTime: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
