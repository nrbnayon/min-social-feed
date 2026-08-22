import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsQuery } from "@/hooks/usePostsQuery";
import { useAuth } from "@/store/auth.store";
import { useToastStore } from "@/store/useToastStore";
import { PostCard } from "@/components/feed/PostCard";
import { Avatar } from "@/components/Shared/Avatar";
import { Input } from "@/components/ui/input";
import { CommentSheet } from "@/components/comments/CommentSheet";
import { ShareModal } from "@/components/feed/ShareModal";
import { appShadow } from "@/lib/utils";
import type { Post } from "@/types";
import {
  Search,
  Users,
  SearchX,
  BadgeCheck,
  TrendingUp,
  CheckCircle2,
} from "lucide-react-native";

const PAGE_SIZE = 5;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { data: postsData, isLoading, isRefetching, refetch } = usePostsQuery();
  const posts = postsData?.items ?? [];
  const currentUser = useAuth((s) => s.user);
  const showToast = useToastStore((s) => s.showToast);

  const currentUserId = currentUser?.id;
  const currentUsername = (currentUser?.username || "").toLowerCase().replace(/^@/, "");

  const [query, setQuery] = useState("");
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  // Pagination state (infinite scroll)
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset page whenever search query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  // Dynamically derive unique creators from real backend posts (excluding current user)
  const dynamicCreators = useMemo(() => {
    const map = new Map<string, { id: string; name: string; username: string; avatar?: string; verified?: boolean }>();
    posts.forEach((p) => {
      const uId = p.userId || p.author?.id || p.username;
      const uName = p.name || p.username || "User";
      const uUsername = (p.username || p.author?.username || "user").replace(/^@/, "");

      // Do not suggest the logged in user to follow themselves
      if (
        uId &&
        uId !== currentUserId &&
        uUsername.toLowerCase() !== currentUsername &&
        !map.has(uId)
      ) {
        map.set(uId, {
          id: uId,
          name: uName,
          username: uUsername,
          avatar: p.avatar || p.author?.avatarUrl,
          verified: p.verified,
        });
      }
    });
    return Array.from(map.values()).slice(0, 10);
  }, [posts, currentUserId, currentUsername]);

  const toggleFollow = (userId: string, name: string) => {
    if (followedIds.includes(userId)) {
      setFollowedIds((prev) => prev.filter((id) => id !== userId));
      showToast(`Unfollowed @${name}`, "👋");
    } else {
      setFollowedIds((prev) => [...prev, userId]);
      showToast(`Followed @${name}`, "✨");
    }
  };

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase().trim().replace(/^@/, "");
    return posts.filter((p) => {
      const u = (p.username || p.author?.username || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      const c = (p.content || "").toLowerCase();
      return u.includes(q) || n.includes(q) || c.includes(q);
    });
  }, [posts, query]);

  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, page * PAGE_SIZE);
  }, [filteredPosts, page]);

  const hasMore = visiblePosts.length < filteredPosts.length;

  const handleRefresh = async () => {
    setPage(1);
    await refetch();
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 350);
  };

  // Scrollable header: Search bar + Dynamic Suggested Creators
  const listHeader = useMemo(
    () => (
      <View className="pt-2">
        {/* 1. Reusable Search Input */}
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search creators, handles, or posts..."
          leftIcon={<Search size={18} color={colors.text3} />}
          clearable
          onClear={() => setQuery("")}
          inputHeight={44}
          containerClassName="px-4 mb-3"
        />

        {/* 2. Suggested Creators Section (Only show if creators exist) */}
        {dynamicCreators.length > 0 && (
          <View className="mb-4">
            <View className="px-4 mb-2.5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Users size={16} color={colors.brand2} />
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-bold tracking-tight"
                >
                  Active Creators
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 10,
                paddingVertical: 6,
              }}
            >
              {dynamicCreators.map((user) => {
                const isFollowing = followedIds.includes(user.id);
                return (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => router.push(`/(protected)/user/${user.id}` as any)}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: isDark ? "rgba(99, 102, 241, 0.22)" : colors.border,
                      width: 148,
                    }}
                    className={`p-3.5 rounded-2xl border items-center ${appShadow}`}
                  >
                    <Avatar
                      src={user.avatar}
                      size={50}
                      gradientBorder={true}
                      name={user.name}
                      onPress={() => router.push(`/(protected)/user/${user.id}` as any)}
                    />

                    <View className="flex-row items-center gap-1 mt-2 mb-0.5">
                      <Text
                        style={{ color: colors.text }}
                        className="text-xs font-bold text-center"
                        numberOfLines={1}
                      >
                        {user.name}
                      </Text>
                      {user.verified && (
                        <BadgeCheck size={13} color="#FFFFFF" fill="#3B82F6" strokeWidth={2.5} />
                      )}
                    </View>

                    <Text
                      style={{ color: colors.text3 }}
                      className="text-[11px] text-center mb-3"
                      numberOfLines={1}
                    >
                      @{user.username}
                    </Text>

                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFollow(user.id, user.username);
                      }}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: isFollowing ? colors.surface2 : colors.brand,
                        borderColor: isFollowing ? colors.border : colors.brand,
                      }}
                      className="w-full py-1.5 rounded-full border items-center justify-center"
                    >
                      <Text
                        style={{ color: isFollowing ? colors.text2 : "#FFFFFF" }}
                        className="text-[11px] font-bold"
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Trending Posts Section Title */}
        <View className="px-4 mt-1 mb-2 flex-row items-center gap-1.5">
          <TrendingUp size={16} color={colors.pink} />
          <Text
            style={{ color: colors.text }}
            className="text-sm font-bold tracking-tight"
          >
            {query ? `Search Results (${filteredPosts.length})` : "Discover Posts"}
          </Text>
        </View>
      </View>
    ),
    [query, followedIds, colors, isDark, dynamicCreators, filteredPosts.length]
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* 🌟 1. Top Header */}
      <View
        style={{
          paddingTop: insets.top + (Platform.OS === "ios" ? 6 : 10),
          paddingBottom: 10,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "rgba(9, 10, 18, 0.95)" : "rgba(248, 250, 252, 0.95)",
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        }}
        className="flex-row items-center justify-between"
      >
        <Text
          style={{ color: colors.text }}
          className="text-xl font-black tracking-tight"
        >
          Explore
        </Text>
      </View>

      {/* 📜 Feed Posts List */}
      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id || item._id || String(Math.random())}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onCommentPress={(p) => setCommentPost(p)}
            onSharePress={(p) => setSharePost(p)}
          />
        )}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-5 items-center justify-center">
              <ActivityIndicator size="small" color={colors.brand} />
            </View>
          ) : !hasMore && visiblePosts.length > 0 ? (
            <View className="py-6 items-center flex-row justify-center gap-1.5 opacity-60">
              <CheckCircle2 size={14} color={colors.text3} />
              <Text
                style={{ color: colors.text3 }}
                className="text-xs font-medium"
              >
                You've explored all posts
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="px-6 py-12 items-center">
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.surface2,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <SearchX size={26} color={colors.text3} />
              </View>
              <Text
                style={{ color: colors.text }}
                className="text-base font-bold text-center mb-1"
              >
                No posts found
              </Text>
              <Text
                style={{ color: colors.text3 }}
                className="text-sm text-center mb-4"
              >
                {query
                  ? `No posts matching "${query}".`
                  : "No posts yet. Head to Home to create one!"}
              </Text>
            </View>
          ) : (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={colors.brand} />
            </View>
          )
        }
      />

      {/* 💬 Comment Sheet Modal */}
      {commentPost && (
        <CommentSheet
          post={posts.find((p) => (p.id || p._id) === (commentPost.id || commentPost._id)) || commentPost}
          onClose={() => setCommentPost(null)}
        />
      )}

      {/* 🔗 Share Sheet Modal */}
      {sharePost && (
        <ShareModal
          post={sharePost}
          onClose={() => setSharePost(null)}
        />
      )}
    </View>
  );
}
