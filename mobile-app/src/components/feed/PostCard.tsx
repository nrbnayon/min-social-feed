import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Share as NativeShare,
} from "react-native";
import { router } from "expo-router";
import type { Post } from "@/types";
import { Avatar } from "@/components/Shared/Avatar";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Eye,
} from "lucide-react-native";

interface PostCardProps {
  post: Post;
  onCommentPress?: (post: Post) => void;
  onSharePress?: (post: Post) => void;
}

export function PostCard({ post, onCommentPress, onSharePress }: PostCardProps) {
  const { colors, isDark } = useAppTheme();
  const { toggleLike, toggleBookmark } = usePostsStore();
  const currentUser = useAuth((s) => s.user);

  const postId = post.id || post._id || "";
  const currentUserId = currentUser?.id || "u0";
  const isLiked = (post.likes || []).includes(currentUserId);
  const isBookmarked = (post.bookmarks || []).includes(currentUserId);
  const likeCount = post.likes ? post.likes.length : (post.likeCount || 0);
  const commentCount = post.comments ? post.comments.length : (post.commentCount || 0);

  const authorName = post.name || post.author?.username || post.username || "User";
  const authorUsername = post.username || post.author?.username || "user";
  const authorAvatar = post.avatar || post.author?.avatarUrl || currentUser?.avatar;

  const handleLike = () => {
    toggleLike(
      postId,
      currentUserId,
      currentUser?.name || "User",
      currentUser?.avatar
    );
  };

  const handleBookmark = () => {
    toggleBookmark(postId, currentUserId);
  };

  const handleShare = () => {
    if (onSharePress) {
      onSharePress(post);
    } else {
      NativeShare.share({
        message: `${post.content}\n\nShared via MiniSocial`,
      }).catch(() => {});
    }
  };

  const handleCardPress = () => {
    router.push(`/(protected)/post/${postId}`);
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <Avatar
            src={authorAvatar}
            size={42}
            name={authorName}
            verified={post.verified}
          />
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {authorName}
              </Text>
              {post.verified && (
                <View style={styles.verifiedDot}>
                  <Text style={styles.verifiedDotText}>✓</Text>
                </View>
              )}
            </View>
            <View style={styles.subRow}>
              <Text style={[styles.username, { color: colors.text2 }]} numberOfLines={1}>
                @{authorUsername}
              </Text>
              <Text style={[styles.dot, { color: colors.text3 }]}>•</Text>
              <Text style={[styles.timeAgo, { color: colors.text3 }]}>
                {post.timeAgo || "recently"}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleShare}
          style={styles.moreButton}
          hitSlop={10}
        >
          <MoreHorizontal size={18} color={colors.text3} />
        </Pressable>
      </View>

      {/* Content text */}
      <Text style={[styles.content, { color: colors.text }]}>
        {post.content}
      </Text>

      {/* Image attachment */}
      {post.image ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: post.image }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagContainer}>
          {post.tags.map((tag, idx) => (
            <View
              key={idx}
              style={[
                styles.tagPill,
                {
                  backgroundColor: isDark
                    ? "rgba(99, 102, 241, 0.12)"
                    : "rgba(99, 102, 241, 0.08)",
                  borderColor: isDark
                    ? "rgba(99, 102, 241, 0.25)"
                    : "rgba(99, 102, 241, 0.2)",
                },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.brand2 }]}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer Actions */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.border,
          },
        ]}
      >
        {/* Like */}
        <Pressable
          onPress={handleLike}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Heart
            size={18}
            color={isLiked ? colors.pink : colors.text2}
            fill={isLiked ? colors.pink : "none"}
          />
          <Text
            style={[
              styles.actionCount,
              {
                color: isLiked ? colors.pink : colors.text2,
                fontWeight: isLiked ? "700" : "500",
              },
            ]}
          >
            {likeCount > 0 ? likeCount : ""}
          </Text>
        </Pressable>

        {/* Comment */}
        <Pressable
          onPress={() => onCommentPress ? onCommentPress(post) : handleCardPress()}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <MessageCircle size={18} color={colors.text2} />
          <Text style={[styles.actionCount, { color: colors.text2 }]}>
            {commentCount > 0 ? commentCount : ""}
          </Text>
        </Pressable>

        {/* Share */}
        <Pressable
          onPress={handleShare}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Share2 size={18} color={colors.text2} />
          <Text style={[styles.actionCount, { color: colors.text2 }]}>
            {post.shares > 0 ? post.shares : ""}
          </Text>
        </Pressable>

        {/* Bookmark */}
        <Pressable
          onPress={handleBookmark}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Bookmark
            size={18}
            color={isBookmarked ? colors.brand2 : colors.text2}
            fill={isBookmarked ? colors.brand2 : "none"}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  verifiedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedDotText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "900",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  username: {
    fontSize: 12,
    fontWeight: "500",
  },
  dot: {
    fontSize: 10,
  },
  timeAgo: {
    fontSize: 11,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: "400",
  },
  imageContainer: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    height: 200,
    width: "100%",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  tagPill: {
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default PostCard;
