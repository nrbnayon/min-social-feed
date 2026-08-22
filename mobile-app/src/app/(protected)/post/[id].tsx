import React, { useState, useRef } from "react";
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
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/context/ThemeContext";
import {
  usePostsQuery,
  useLikeMutation,
  useCommentMutation,
  normalizePost,
  buildThreadedComments,
} from "@/hooks/usePostsQuery";
import { useAuth } from "@/store/auth.store";
import { Avatar } from "@/components/Shared/Avatar";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShareModal } from "@/components/feed/ShareModal";
import { CommentThreadItem, type ReplyTarget } from "@/components/comments/CommentThreadItem";
import { Gradients } from "@/constants/theme";
import { appShadow, formatCount } from "@/lib/utils";
import { postService } from "@/services/post.service";
import type { Post } from "@/types";
import {
  Send,
  MessageSquare,
  Heart,
  Share2,
  BadgeCheck,
  ChevronDown,
  X,
} from "lucide-react-native";

const PAGE_SIZE = 7;

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const currentUser = useAuth((s) => s.user);
  const currentUserId = currentUser?.id || "";

  const { data: postsData } = usePostsQuery();
  const posts = postsData?.items ?? [];
  const likeMutation = useLikeMutation(currentUserId);
  const commentMutation = useCommentMutation(currentUser);

  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  // Comments pagination state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Try to find post in the feed cache as an initial fallback
  const cachedPost = posts.find((p) => (p.id || p._id) === id);

  // Query the post directly with Socket.io real-time sync
  const { data: fetchedPost, isLoading: isFetchingPost } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const raw = await postService.getById(id!);
      return normalizePost(raw);
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });

  // Prefer the freshest directly fetched post data, fallback to feed cache
  const post = fetchedPost ?? cachedPost;

  const postId = post?.id || post?._id || "";
  const isLiked = post && (post.likes || []).includes(currentUserId);
  const likeCount = typeof post?.likeCount === "number" ? post.likeCount : (post?.likes?.length || 0);
  const commentCount = typeof post?.commentCount === "number" ? post.commentCount : (post?.comments?.length || 0);

  const authorName = post?.name || post?.author?.username || post?.username || "User";
  const authorUsername = (post?.username || post?.author?.username || "user").replace(/^@/, "");
  const authorAvatar = post?.avatar || post?.author?.avatarUrl || currentUser?.avatar;

  const handleLike = () => {
    if (!post) return;
    void likeMutation.mutate(postId);
  };

  const handleShare = () => {
    if (!post) return;
    NativeShare.share({
      message: `${post.content}\n\nPosted by @${authorUsername} on MiniSocial`,
    }).catch(() => { });
  };

  const handleReply = (target: ReplyTarget) => {
    setReplyTarget(target);
    setCommentText((prev) => {
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
      setCommentText((prev) => prev.replace(new RegExp(`^@${replyTarget.username}\\s*`), ""));
      setReplyTarget(null);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !id || commentMutation.isPending) return;
    const text = commentText.trim();
    const parentId = replyTarget?.parentId;
    const replyTo = replyTarget?.authorId;

    setCommentText("");
    setReplyTarget(null);
    try {
      await commentMutation.mutateAsync({
        postId: id,
        content: text,
        parentId,
        replyTo,
      });
      setVisibleCount((prev) => Math.max(prev, (post?.comments?.length || 0) + 1));
    } catch {
      // Handled in mutation
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
        <View style={{ paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <BackButton onPress={() => router.back()} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>Post</Text>
          <View style={{ width: 38 }} />
        </View>
        {isFetchingPost ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={{ color: colors.text3, fontSize: 14 }}>Loading post…</Text>
          </View>
        ) : (
          <EmptyState
            icon="🔍"
            title="Post not found"
            description="This post may have been deleted or does not exist."
          />
        )}
      </View>
    );
  }

  const rawComments = post.comments || [];
  const threadedComments = buildThreadedComments(rawComments);
  const displayedComments = threadedComments.slice(0, visibleCount);
  const remainingCount = threadedComments.length - displayedComments.length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 8,
      }}
    >
      {/* 🧭 Top Bar Navigation */}
      <View
        style={{
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        }}
        className="px-4 pb-3 flex-row items-center justify-between"
      >
        <BackButton onPress={() => router.back()} />
        <Text
          style={{ color: colors.text }}
          className="text-lg font-bold tracking-tight"
        >
          Post
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {/* 📜 Content List */}
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
            {/* 📝 Main Post */}
            <View
              style={{
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
              }}
              className="px-5 pt-4 pb-4"
            >
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

              <View
                style={{
                  borderTopColor: isDark ? "rgba(255, 255, 255, 0.08)" : colors.border,
                  borderTopWidth: 1,
                  paddingTop: 12,
                }}
                className="flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-6">
                  <TouchableOpacity
                    onPress={handleLike}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2"
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

                {/* Right: Share Button */}
                <TouchableOpacity
                  onPress={handleShare}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1 rounded-full"
                >
                  <Share2 size={19} color={colors.text3} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 💬 Comments Section Heading */}
            <View
              style={{
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
              }}
              className="px-5 py-3 flex-row items-center justify-between"
            >
              <Text
                style={{ color: colors.text }}
                className="text-sm font-bold tracking-tight uppercase"
              >
                Comments
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface2,
                }}
                className="px-2.5 py-0.5 rounded-full"
              >
                <Text
                  style={{ color: colors.text3 }}
                  className="text-xs font-bold"
                >
                  {rawComments.length}
                </Text>
              </View>
            </View>
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
          ) : threadedComments.length > PAGE_SIZE ? (
            <View className="py-4 items-center">
              <Text
                style={{ color: colors.text3 }}
                className="text-xs font-medium"
              >
                All {rawComments.length} comments
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View className="px-4 pt-3">
            <CommentThreadItem
              comment={item}
              postAuthorId={post.userId || post.author?.id || post.author?.username}
              onReply={handleReply}
              onUserPress={(uid) => router.push(`/(protected)/user/${uid}` as any)}
            />
          </View>
        )}
      />

      {/* 💬 Replying Bar (if user tapped reply) */}
      {replyTarget && (
        <View
          style={{
            backgroundColor: isDark ? "rgba(99, 102, 241, 0.12)" : "rgba(99, 102, 241, 0.08)",
            borderTopColor: colors.border,
          }}
          className="px-4 py-2 flex-row items-center justify-between border-t"
        >
          <Text style={{ color: colors.text2 }} className="text-xs">
            Replying to <Text style={{ color: colors.brand2, fontWeight: "700" }}>@{replyTarget.username}</Text>
          </Text>
          <Pressable onPress={handleCancelReply} hitSlop={8} className="p-1">
            <X size={14} color={colors.text3} />
          </Pressable>
        </View>
      )}

      {/* 💬 Bottom Fixed Comment Input */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopColor: replyTarget ? "transparent" : colors.border,
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
            borderColor: replyTarget ? colors.brand : colors.border,
            height: 44,
          }}
          className="flex-row items-center px-3.5 rounded-full border"
        >
          <TextInput
            ref={inputRef}
            value={commentText}
            onChangeText={setCommentText}
            placeholder={replyTarget ? `Reply to @${replyTarget.username}...` : "Post your reply..."}
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
            disabled={!commentText.trim() || commentMutation.isPending}
            activeOpacity={0.8}
            style={{
              opacity: commentText.trim() && !commentMutation.isPending ? 1 : 0.4,
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
              {commentMutation.isPending ? (
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
