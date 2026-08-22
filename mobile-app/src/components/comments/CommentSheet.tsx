import React, { useState, useRef } from "react";
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
import type { Post } from "@/types";
import { Avatar } from "@/components/Shared/Avatar";
import { useAppTheme } from "@/context/ThemeContext";
import { useCommentMutation, buildThreadedComments } from "@/hooks/usePostsQuery";
import { useAuth } from "@/store/auth.store";
import { CommentThreadItem, type ReplyTarget } from "./CommentThreadItem";
import { X, Send } from "lucide-react-native";
import { router } from "expo-router";

interface CommentSheetProps {
  post: Post | null;
  onClose: () => void;
}

export function CommentSheet({ post, onClose }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const currentUser = useAuth((s) => s.user);
  const commentMutation = useCommentMutation(currentUser);

  const [text, setText] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const inputRef = useRef<TextInput>(null);

  if (!post) return null;

  const postId = post.id || post._id || "";
  const rawComments = post.comments || [];
  const threadedComments = buildThreadedComments(rawComments);

  const handleReply = (target: ReplyTarget) => {
    setReplyTarget(target);
    setText((prev) => {
      const mention = `@${target.username} `;
      if (prev.startsWith(mention)) return prev;
      return `${mention}${prev.replace(/^@\w+\s*/, "")}`;
    });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCancelReply = () => {
    if (replyTarget) {
      setText((prev) => prev.replace(new RegExp(`^@${replyTarget.username}\\s*`), ""));
      setReplyTarget(null);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    const parentId = replyTarget?.parentId;
    const replyTo = replyTarget?.authorId;

    setText("");
    setReplyTarget(null);
    await commentMutation.mutateAsync({
      postId,
      content: trimmed,
      parentId,
      replyTo,
    });
  };

  const handleUserPress = (userId: string) => {
    onClose();
    router.push(`/(protected)/user/${userId}` as any);
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
              Comments ({rawComments.length})
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X size={20} color={colors.text2} />
            </Pressable>
          </View>

          {/* Comment List */}
          <FlatList
            data={threadedComments}
            keyExtractor={(item, index) => item.id || item._id || String(index)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.text3 }]}>
                  No comments yet. Be the first to start the conversation! 💬
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <CommentThreadItem
                comment={item}
                postAuthorId={post.userId || post.author?.id || post.author?.username}
                onReply={handleReply}
                onUserPress={handleUserPress}
              />
            )}
          />

          {/* Replying Banner */}
          {replyTarget && (
            <View
              style={[
                styles.replyingBar,
                {
                  backgroundColor: isDark ? "rgba(99, 102, 241, 0.12)" : "rgba(99, 102, 241, 0.08)",
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.replyingText, { color: colors.text2 }]}>
                Replying to <Text style={{ color: colors.brand2, fontWeight: "700" }}>@{replyTarget.username}</Text>
              </Text>
              <Pressable onPress={handleCancelReply} hitSlop={8} style={styles.cancelReplyBtn}>
                <X size={14} color={colors.text3} />
              </Pressable>
            </View>
          )}

          {/* Bottom Input */}
          <View
            style={[
              styles.inputRow,
              {
                borderTopColor: replyTarget ? "transparent" : colors.border,
                backgroundColor: colors.surface,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            <Avatar src={currentUser?.avatar} size={34} name={currentUser?.name} />
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder={replyTarget ? `Reply to @${replyTarget.username}...` : "Add a comment..."}
              placeholderTextColor={colors.text3}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface2,
                  borderColor: replyTarget ? colors.brand : colors.border,
                  color: colors.text,
                },
              ]}
            />
            <Pressable
              onPress={handleSend}
              disabled={!text.trim() || commentMutation.isPending}
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
    maxHeight: "85%",
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
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
  replyingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  replyingText: {
    fontSize: 12.5,
  },
  cancelReplyBtn: {
    padding: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
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

export default CommentSheet;
