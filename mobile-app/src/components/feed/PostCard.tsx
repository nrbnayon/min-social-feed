import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share as NativeShare,
} from "react-native";
import { router } from "expo-router";
import type { Post } from "@/types";
import { Avatar } from "@/components/Shared/Avatar";
import { useAppTheme } from "@/context/ThemeContext";
import { useLikeMutation } from "@/hooks/usePostsQuery";
import { useAuth } from "@/store/auth.store";
import { formatCount } from "@/lib/utils";
import {
  Heart,
  MessageSquare,
  Share2,
  BadgeCheck,
} from "lucide-react-native";

interface PostCardProps {
  post: Post;
  truncate?: boolean;
  isDetail?: boolean;
  onCommentPress?: (post: Post) => void;
  onSharePress?: (post: Post) => void;
}

export function PostCard({
  post,
  truncate = true,
  isDetail = false,
  onCommentPress,
  onSharePress,
}: PostCardProps) {
  const { colors, isDark } = useAppTheme();
  const currentUser = useAuth((s) => s.user);
  const currentUserId = currentUser?.id || "";
  const likeMutation = useLikeMutation(currentUserId);

  const [isExpanded, setIsExpanded] = useState(false);

  const postId = post.id || post._id || "";
  const isLiked = (post.likes || []).includes(currentUserId);
  const likeCount = post.likes ? post.likes.length : (post.likeCount || 0);
  const commentCount = post.comments ? post.comments.length : (post.commentCount || 0);

  const authorName = post.name || post.author?.username || post.username || "User";
  const authorUsername = (post.username || post.author?.username || "user").replace(/^@/, "");
  const authorAvatar = post.avatar || post.author?.avatarUrl || currentUser?.avatar;

  const shouldTruncate = truncate && !isDetail;
  const isLongText = (post.content || "").length > 180;

  const handleLike = () => {
    void likeMutation.mutate(postId);
  };

  const handleShare = () => {
    if (onSharePress) {
      onSharePress(post);
    } else {
      NativeShare.share({
        message: `${post.content}\n\nPosted by @${authorUsername} on MiniSocial`,
      }).catch(() => { });
    }
  };

  const handleCardPress = () => {
    if (!isDetail) {
      router.push(`/(protected)/post/${postId}` as any);
    }
  };

  const handleUserPress = (e?: any) => {
    e?.stopPropagation?.();
    const targetUserId = post.userId || post.author?.id || authorUsername;
    router.push(`/(protected)/user/${targetUserId}` as any);
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      disabled={isDetail}
      activeOpacity={isDetail ? 1 : 0.9}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? "rgba(99, 102, 241, 0.28)" : colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          src={authorAvatar}
          size={42}
          gradientBorder={true}
          name={authorName}
          onPress={handleUserPress}
        />
        <TouchableOpacity
          onPress={handleUserPress}
          activeOpacity={0.7}
          style={styles.authorInfo}
        >
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {authorName}
            </Text>
            {post.verified && (
              <BadgeCheck size={16} color="#FFFFFF" fill="#3B82F6" strokeWidth={2.5} />
            )}
          </View>
          <Text style={[styles.usernameRow, { color: colors.text3 }]} numberOfLines={1}>
            @{authorUsername} · {post.timeAgo || "now"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Post Text Content */}
      <Text
        style={[styles.content, { color: colors.text }]}
        numberOfLines={shouldTruncate ? (isExpanded ? undefined : 4) : undefined}
      >
        {post.content}
      </Text>

      {shouldTruncate && isLongText && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            setIsExpanded(!isExpanded);
          }}
          activeOpacity={0.7}
          className="-mt-2 mb-3"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ color: colors.brand2, fontSize: 13, fontWeight: "600" }}>
            {isExpanded ? "Show less" : "Show more..."}
          </Text>
        </TouchableOpacity>
      )}

      {/* Action Footer: Like, Comment, Share */}
      <View style={[styles.footer, { borderTopColor: isDark ? "rgba(255, 255, 255, 0.08)" : colors.border }]}>
        {/* Left Actions: Like & Comment */}
        <View style={styles.leftActions}>
          {/* Like */}
          <TouchableOpacity
            onPress={handleLike}
            activeOpacity={0.7}
            style={styles.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Heart
              size={18}
              color={isLiked ? colors.pink : colors.text3}
              fill={isLiked ? colors.pink : "none"}
            />
            <Text
              style={[
                styles.actionCount,
                { color: isLiked ? colors.pink : colors.text3 },
              ]}
            >
              {formatCount(likeCount)}
            </Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity
            onPress={() => onCommentPress ? onCommentPress(post) : handleCardPress()}
            activeOpacity={0.7}
            style={styles.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MessageSquare size={18} color={colors.text3} />
            <Text style={[styles.actionCount, { color: colors.text3 }]}>
              {formatCount(commentCount)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Action: Share */}
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.7}
          style={styles.shareBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Share2 size={16} color={colors.text3} />
          <Text style={[styles.shareText, { color: colors.text3 }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  usernameRow: {
    fontSize: 13,
    marginTop: 1.5,
  },
  content: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  shareText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default PostCard;
