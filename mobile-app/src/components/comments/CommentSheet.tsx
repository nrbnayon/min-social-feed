import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Post, Comment } from "@/types";
import { Avatar } from "@/components/Shared/Avatar";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { X, Send, Heart } from "lucide-react-native";

interface CommentSheetProps {
  post: Post | null;
  onClose: () => void;
}

export function CommentSheet({ post, onClose }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { addComment } = usePostsStore();
  const currentUser = useAuth((s) => s.user);

  const [text, setText] = useState("");

  if (!post) return null;

  const postId = post.id || post._id || "";
  const comments = post.comments || [];

  const handleSend = () => {
    if (!text.trim()) return;
    addComment(postId, text.trim(), currentUser);
    setText("");
  };

  return (
    <Modal
      visible={Boolean(post)}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          {/* Grab Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Comments ({comments.length})
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X size={20} color={colors.text2} />
            </Pressable>
          </View>

          {/* Comment List */}
          <FlatList
            data={comments}
            keyExtractor={(item, index) => item.id || item._id || String(index)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.text3 }]}>
                  No comments yet. Be the first to comment! 💬
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
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

                <Pressable style={styles.commentLikeBtn}>
                  <Heart size={14} color={colors.text3} />
                  {item.likes > 0 && (
                    <Text style={[styles.commentLikeCount, { color: colors.text3 }]}>
                      {item.likes}
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          />

          {/* Bottom Input */}
          <View
            style={[
              styles.inputRow,
              {
                borderTopColor: colors.border,
                backgroundColor: colors.surface,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            <Avatar src={currentUser?.avatar} size={34} name={currentUser?.name} />
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Add a comment..."
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
              onPress={handleSend}
              disabled={!text.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: text.trim() ? colors.brand : colors.surface2,
                  opacity: text.trim() ? 1 : 0.5,
                },
              ]}
            >
              <Send size={16} color={text.trim() ? "#FFF" : colors.text3} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
  sheetContainer: {
    maxHeight: "80%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
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
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
  commentLikeBtn: {
    alignItems: "center",
    padding: 4,
    gap: 2,
  },
  commentLikeCount: {
    fontSize: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
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

export default CommentSheet;
