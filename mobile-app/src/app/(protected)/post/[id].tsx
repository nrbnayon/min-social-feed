import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Share as NativeShare,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { Avatar } from "@/components/Shared/Avatar";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShareModal } from "@/components/feed/ShareModal";
import { Gradients } from "@/constants/theme";
import { appShadow, formatCount } from "@/lib/utils";
import type { Post } from "@/types";
import {
  Send,
  MessageSquare,
  Heart,
  Share2,
  BadgeCheck,
  ChevronDown,
} from "lucide-react-native";

const PAGE_SIZE = 7;

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { posts, addComment, toggleLike } = usePostsStore();
  const currentUser = useAuth((s) => s.user);

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  // Comments pagination state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const post = posts.find((p) => (p.id || p._id) === id);
  const postId = post?.id || post?._id || "";
  const currentUserId = currentUser?.id || "u0";
  const isLiked = post && (post.likes || []).includes(currentUserId);
  const likeCount = post?.likes ? post.likes.length : (post?.likeCount || 0);
  const commentCount = post?.comments ? post.comments.length : (post?.commentCount || 0);

  const authorName = post?.name || post?.author?.username || post?.username || "User";
  const authorUsername = (post?.username || post?.author?.username || "user").replace(/^@/, "");
  const authorAvatar = post?.avatar || post?.author?.avatarUrl || currentUser?.avatar;

  const handleLike = () => {
    if (!post) return;
    toggleLike(
      postId,
      currentUserId,
      currentUser?.name || "User",
      currentUser?.avatar
    );
  };

  const handleShare = () => {
    if (!post) return;
    NativeShare.share({
      message: `${post.content}\n\nPosted by @${authorUsername} on MiniSocial`,
    }).catch(() => { });
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addComment(id, commentText.trim(), currentUser);
      setCommentText("");
      // Ensure newly added comment is visible
      setVisibleCount((prev) => Math.max(prev, (post?.comments?.length || 0) + 1));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMoreComments = () => {
    if (isLoadingMore || !post?.comments) return;
    if (visibleCount >= post.comments.length) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 250);
  };

  if (!post) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top + 8,
        }}
      >
        <View className="px-4 pb-3 flex-row items-center justify-between border-b border-border">
          <BackButton onPress={() => router.back()} />
          <Text style={{ color: colors.text }} className="text-lg font-bold">
            Post
          </Text>
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

  const allComments = post.comments || [];
  const displayedComments = allComments.slice(0, visibleCount);
  const remainingCount = allComments.length - displayedComments.length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* 🌟 Top Navigation Bar */}
      <View
        style={{
          paddingTop: insets.top + (Platform.OS === "ios" ? 4 : 10),
          paddingBottom: 10,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "rgba(9, 10, 18, 0.95)" : "rgba(248, 250, 252, 0.95)",
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        }}
        className="flex-row items-center justify-between"
      >
        <BackButton onPress={() => router.back()} />
        <Text
          style={{ color: colors.text }}
          className="text-lg font-bold tracking-tight"
        >
          Post Details
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.7}
          className="p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Share2 size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* 📜 Main Post + Comments List */}
      <FlatList
        data={displayedComments}
        keyExtractor={(item, index) => item.id || item._id || String(index)}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 90,
        }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMoreComments}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View>
            {/* 📝 Main Post (Seamless Edge-to-Edge view, no card border) */}
            <View
              style={{
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
              }}
              className="px-5 pt-4 pb-4"
            >
              {/* Author Row */}
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/(protected)/user/${post.userId || post.author?.id || authorUsername}` as any
                  )
                }
                activeOpacity={0.7}
                className="flex-row items-center mb-3.5"
              >
                <Avatar
                  src={authorAvatar}
                  size={46}
                  gradientBorder={true}
                  name={authorName}
                  onPress={() =>
                    router.push(
                      `/(protected)/user/${post.userId || post.author?.id || authorUsername}` as any
                    )
                  }
                />
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text
                      style={{ color: colors.text }}
                      className="text-base font-bold"
                    >
                      {authorName}
                    </Text>
                    {post.verified && (
                      <BadgeCheck size={16} color="#FFFFFF" fill="#3B82F6" strokeWidth={2.5} />
                    )}
                  </View>
                  <Text
                    style={{ color: colors.text3 }}
                    className="text-xs mt-0.5"
                  >
                    @{authorUsername} · {post.timeAgo || "now"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Full Text Content */}
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  lineHeight: 24,
                }}
                className="mb-4"
              >
                {post.content}
              </Text>

              {/* Post Action Footer */}
              <View
                style={{
                  borderTopColor: isDark ? "rgba(255, 255, 255, 0.08)" : colors.border,
                  borderTopWidth: 1,
                  paddingTop: 12,
                }}
                className="flex-row items-center justify-between"
              >
                {/* Left: Like & Comment Counts */}
                <View className="flex-row items-center gap-6">
                  {/* Like Button */}
                  <TouchableOpacity
                    onPress={handleLike}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Heart
                      size={20}
                      color={isLiked ? colors.pink : colors.text3}
                      fill={isLiked ? colors.pink : "none"}
                    />
                    <Text
                      style={{
                        color: isLiked ? colors.pink : colors.text3,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {formatCount(likeCount)}
                    </Text>
                  </TouchableOpacity>

                  {/* Comments Count */}
                  <View className="flex-row items-center gap-2">
                    <MessageSquare size={20} color={colors.text3} />
                    <Text
                      style={{
                        color: colors.text3,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {formatCount(commentCount)}
                    </Text>
                  </View>
                </View>

                {/* Right: Share */}
                <TouchableOpacity
                  onPress={handleShare}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-1.5"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Share2 size={18} color={colors.text3} />
                  <Text
                    style={{ color: colors.text3 }}
                    className="text-sm font-semibold"
                  >
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 💬 Comments Section Header */}
            <View
              style={{
                borderBottomColor: colors.border,
                backgroundColor: isDark ? "#0D0F18" : "#F1F5F9",
              }}
              className="px-5 py-3 border-b flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2">
                <MessageSquare size={16} color={colors.brand2} />
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold"
                >
                  Comments
                </Text>
              </View>
              <View
                style={{ backgroundColor: colors.surface2 }}
                className="px-2.5 py-0.5 rounded-full"
              >
                <Text
                  style={{ color: colors.text3 }}
                  className="text-xs font-bold"
                >
                  {allComments.length}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="px-6 py-10 items-center">
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.surface2,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <MessageSquare size={22} color={colors.text3} />
            </View>
            <Text
              style={{ color: colors.text }}
              className="text-sm font-bold text-center mb-1"
            >
              No comments yet
            </Text>
            <Text
              style={{ color: colors.text3 }}
              className="text-xs text-center"
            >
              Be the first to share your thoughts below! 💬
            </Text>
          </View>
        }
        ListFooterComponent={
          remainingCount > 0 ? (
            <View className="px-5 py-4 items-center">
              <TouchableOpacity
                onPress={handleLoadMoreComments}
                disabled={isLoadingMore}
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className={`flex-row items-center justify-center px-4 py-2.5 rounded-xl border w-full ${appShadow}`}
              >
                {isLoadingMore ? (
                  <ActivityIndicator size="small" color={colors.brand} />
                ) : (
                  <>
                    <Text
                      style={{ color: colors.brand2 }}
                      className="text-xs font-bold mr-1.5"
                    >
                      See more comments ({remainingCount} left)
                    </Text>
                    <ChevronDown size={15} color={colors.brand2} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : allComments.length > PAGE_SIZE ? (
            <View className="py-4 items-center">
              <Text
                style={{ color: colors.text3 }}
                className="text-xs font-medium"
              >
                All {allComments.length} comments loaded
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const authorName = item.name || item.author?.username || item.username || "User";
          const authorUsername = (item.username || item.author?.username || "user").replace(/^@/, "");
          const authorAvatar = item.avatar || item.author?.avatarUrl;
          const commenterId = item.userId || item.author?.id || authorUsername;

          const handleCommenterPress = () => {
            router.push(`/(protected)/user/${commenterId}` as any);
          };

          return (
            <View
              style={{
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
              }}
              className="px-5 py-3.5 flex-row items-start"
            >
              <Avatar
                src={authorAvatar}
                size={36}
                gradientBorder={true}
                name={authorName}
                onPress={handleCommenterPress}
              />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between mb-1">
                  <TouchableOpacity
                    onPress={handleCommenterPress}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{ color: colors.text }}
                      className="text-sm font-bold"
                    >
                      {authorName}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{ color: colors.text3 }}
                    className="text-xs"
                  >
                    {item.time || "recently"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleCommenterPress}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{ color: colors.text3 }}
                    className="text-xs mb-1.5"
                  >
                    @{authorUsername}
                  </Text>
                </TouchableOpacity>

                <Text
                  style={{ color: colors.text }}
                  className="text-sm leading-5"
                >
                  {item.text || item.content}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* 💬 Bottom Fixed Comment Input */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 10,
          paddingHorizontal: 14,
        }}
        className="border-t flex-row items-center gap-2.5"
      >
        <Avatar
          src={currentUser?.avatar}
          size={36}
          gradientBorder={true}
          name={currentUser?.name}
        />

        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface2,
            borderColor: colors.border,
            height: 44,
          }}
          className="flex-row items-center px-3.5 rounded-full border"
        >
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Post your reply..."
            placeholderTextColor={colors.text3}
            style={{
              flex: 1,
              fontSize: 14,
              color: colors.text,
              paddingTop: 0,
              paddingBottom: 0,
              paddingVertical: 0,
              margin: 0,
              height: Platform.OS === "ios" ? 38 : "100%",
              textAlignVertical: "center",
            }}
          />

          <TouchableOpacity
            onPress={handleSendComment}
            disabled={!commentText.trim() || isSubmitting}
            activeOpacity={0.8}
            style={{
              opacity: commentText.trim() && !isSubmitting ? 1 : 0.4,
              width: 32,
              height: 32,
              borderRadius: 16,
              overflow: "hidden",
            }}
            className="items-center justify-center -mr-1"
          >
            <LinearGradient
              colors={Gradients.brand}
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={14} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔗 Share Modal */}
      {sharePost && (
        <ShareModal
          post={sharePost}
          onClose={() => setSharePost(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
