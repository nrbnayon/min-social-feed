import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import type { Comment } from "@/types";
import { Avatar } from "@/components/Shared/Avatar";
import { useAppTheme } from "@/context/ThemeContext";
import {
  CornerDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";

export interface ReplyTarget {
  parentId: string;
  authorId: string;
  username: string;
  name: string;
}

interface CommentThreadItemProps {
  comment: Comment;
  postAuthorId?: string;
  onReply: (target: ReplyTarget) => void;
  onUserPress?: (userId: string) => void;
}

export function CommentThreadItem({
  comment,
  postAuthorId,
  onReply,
  onUserPress,
}: CommentThreadItemProps) {
  const { colors, isDark } = useAppTheme();
  const [showAllReplies, setShowAllReplies] = useState(false);

  const parentId = comment.id || comment._id || "";
  const authorName = comment.name || comment.author?.username || comment.username || "User";
  const authorUsername = (comment.username || comment.author?.username || "user").replace(/^@/, "");
  const authorAvatar = comment.avatar || comment.author?.avatarUrl;
  const authorId = comment.userId || comment.author?.id || (comment.author as any)?._id || authorUsername;
  const isPostAuthor = postAuthorId && (authorId === postAuthorId || authorUsername === postAuthorId);

  const replies = comment.replies || [];
  const visibleReplies = showAllReplies ? replies : (replies.length <= 3 ? replies : replies.slice(0, 2));
  const hiddenReplyCount = replies.length - visibleReplies.length;

  const handleUserClick = (uid: string) => {
    if (onUserPress) {
      onUserPress(uid);
    } else {
      router.push(`/(protected)/user/${uid}` as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Top Level Comment ──────────────────────────────────────────────── */}
      <View style={styles.commentRow}>
        <Avatar
          src={authorAvatar}
          size={36}
          name={authorName}
          onPress={() => handleUserClick(authorId)}
        />

        <View style={styles.bubbleWrapper}>
          {/* Facebook-style Rounded Speech Bubble Card */}
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: isDark ? "rgba(30, 41, 59, 0.75)" : "#F1F5F9",
              },
            ]}
          >
            {/* Author Header */}
            <View style={styles.bubbleHeader}>
              <Pressable
                onPress={() => handleUserClick(authorId)}
                style={styles.authorRow}
              >
                <Text
                  style={[styles.authorName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {authorName}
                </Text>
                {isPostAuthor && (
                  <View
                    style={[
                      styles.authorBadge,
                      { backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.12)" },
                    ]}
                  >
                    <Text style={[styles.authorBadgeText, { color: colors.brand }]}>
                      Author
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Comment Body */}
            <Text style={[styles.commentText, { color: colors.text }]}>
              {comment.text || comment.content}
            </Text>
          </View>

          {/* Action Row below bubble: Timestamp & Reply */}
          <View style={styles.actionRow}>
            <Text style={[styles.timeText, { color: colors.text3 }]}>
              {comment.time || "just now"}
            </Text>

            <Pressable
              onPress={() =>
                onReply({
                  parentId,
                  authorId,
                  username: authorUsername,
                  name: authorName,
                })
              }
              hitSlop={10}
              style={styles.actionBtn}
            >
              <CornerDownRight size={12} color={colors.brand2} />
              <Text style={[styles.actionText, { color: colors.brand2 }]}>
                Reply
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Threaded Nested Replies (Facebook Style) ───────────────────────── */}
      {replies.length > 0 && (
        <View style={styles.threadContainer}>
          {/* Vertical Guide Line */}
          <View
            style={[
              styles.threadGuideLine,
              { backgroundColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1" },
            ]}
          />

          <View style={styles.repliesList}>
            {visibleReplies.map((reply, index) => {
              const rAuthorName = reply.name || reply.author?.username || reply.username || "User";
              const rAuthorUsername = (reply.username || reply.author?.username || "user").replace(/^@/, "");
              const rAuthorAvatar = reply.avatar || reply.author?.avatarUrl;
              const rAuthorId = reply.userId || reply.author?.id || rAuthorUsername;
              const rIsPostAuthor = postAuthorId && (rAuthorId === postAuthorId || rAuthorUsername === postAuthorId);
              const rReplyToUser = reply.replyTo?.name || reply.replyTo?.username;

              return (
                <View key={reply.id || reply._id || String(index)} style={styles.replyRow}>
                  {/* Curved Connector Branch Line */}
                  <View
                    style={[
                      styles.connectorBranch,
                      {
                        borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
                      },
                    ]}
                  />

                  <Avatar
                    src={rAuthorAvatar}
                    size={28}
                    name={rAuthorName}
                    onPress={() => handleUserClick(rAuthorId)}
                  />

                  <View style={styles.bubbleWrapper}>
                    <View
                      style={[
                        styles.bubble,
                        styles.replyBubble,
                        {
                          backgroundColor: isDark ? "rgba(30, 41, 59, 0.6)" : "#F8FAFC",
                          borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#E2E8F0",
                        },
                      ]}
                    >
                      <View style={styles.bubbleHeader}>
                        <Pressable
                          onPress={() => handleUserClick(rAuthorId)}
                          style={styles.authorRow}
                        >
                          <Text
                            style={[styles.replyAuthorName, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {rAuthorName}
                          </Text>
                          {rIsPostAuthor && (
                            <View
                              style={[
                                styles.authorBadge,
                                { backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.12)" },
                              ]}
                            >
                              <Text style={[styles.authorBadgeText, { color: colors.brand }]}>
                                Author
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      </View>

                      {/* Reply Text with highlighted @recipient */}
                      <Text style={[styles.replyCommentText, { color: colors.text }]}>
                        {rReplyToUser && (
                          <Text style={{ color: colors.brand, fontWeight: "700" }}>
                            @{rReplyToUser}{" "}
                          </Text>
                        )}
                        {reply.text || reply.content}
                      </Text>
                    </View>

                    {/* Action Row below reply bubble: Timestamp & Reply */}
                    <View style={styles.actionRow}>
                      <Text style={[styles.timeText, { color: colors.text3 }]}>
                        {reply.time || "just now"}
                      </Text>

                      <Pressable
                        onPress={() =>
                          onReply({
                            parentId,
                            authorId: rAuthorId,
                            username: rAuthorUsername,
                            name: rAuthorName,
                          })
                        }
                        hitSlop={10}
                        style={styles.actionBtn}
                      >
                        <CornerDownRight size={11} color={colors.brand2} />
                        <Text
                          style={[
                            styles.actionText,
                            { color: colors.brand2, fontSize: 11 },
                          ]}
                        >
                          Reply
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Facebook-style Expand / Collapse Replies */}
            {replies.length > 1 && (
              <TouchableOpacity
                onPress={() => setShowAllReplies((prev) => !prev)}
                activeOpacity={0.7}
                style={styles.expandRepliesBtn}
              >
                {showAllReplies ? (
                  <View style={styles.expandRow}>
                    <ChevronUp size={14} color={colors.brand2} />
                    <Text style={[styles.expandText, { color: colors.brand2 }]}>
                      Hide replies
                    </Text>
                  </View>
                ) : (
                  <View style={styles.expandRow}>
                    <ChevronDown size={14} color={colors.brand2} />
                    <Text style={[styles.expandText, { color: colors.brand2 }]}>
                      View {hiddenReplyCount} more {hiddenReplyCount === 1 ? "reply" : "replies"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  bubbleWrapper: {
    flex: 1,
  },
  bubble: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  replyBubble: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  replyAuthorName: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  authorBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  authorBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  commentText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  replyCommentText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 4,
    paddingLeft: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  // Thread hierarchy styling
  threadContainer: {
    marginLeft: 18,
    marginTop: 6,
    position: "relative",
  },
  threadGuideLine: {
    position: "absolute",
    left: 0,
    top: -2,
    bottom: 10,
    width: 1.5,
    borderRadius: 1,
  },
  repliesList: {
    paddingLeft: 16,
    gap: 10,
  },
  replyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    position: "relative",
  },
  connectorBranch: {
    position: "absolute",
    left: -16,
    top: 13,
    width: 13,
    height: 12,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomLeftRadius: 7,
    backgroundColor: "transparent",
  },
  expandRepliesBtn: {
    paddingVertical: 3,
    marginTop: 1,
  },
  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  expandText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
});
