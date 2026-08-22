import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsQuery } from "@/hooks/usePostsQuery";
import {
  useSuggestionsQuery,
  useFollowingQuery,
  useToggleFollowMutation,
} from "@/hooks/useUsersQuery";
import { useAuth } from "@/store/auth.store";
import { PostCard } from "@/components/feed/PostCard";
import { Avatar } from "@/components/Shared/Avatar";
import { Input } from "@/components/ui/input";
import { CommentSheet } from "@/components/comments/CommentSheet";
import { ShareModal } from "@/components/feed/ShareModal";
import { Gradients } from "@/constants/theme";
import type { Post, SuggestedUser } from "@/types";
import {
  Search,
  Users,
  SearchX,
  BadgeCheck,
  UserCheck,
  UserPlus,
  CheckCircle2,
  Sparkles,
} from "lucide-react-native";

const PAGE_SIZE = 6;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const currentUser = useAuth((s) => s.user);

  // Queries & Mutations
  const { data: postsData, isLoading: isPostsLoading, isRefetching: isPostsRefetching, refetch: refetchPosts } = usePostsQuery();
  const { data: suggestions = [], isLoading: isSuggestionsLoading, refetch: refetchSuggestions } = useSuggestionsQuery(15);
  const { data: followingUsers = [], isLoading: isFollowingLoading, refetch: refetchFollowing } = useFollowingQuery();
  const toggleFollowMutation = useToggleFollowMutation();

  const posts = postsData?.items ?? [];

  const [query, setQuery] = useState("");
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [query, selectedCreatorId]);

  // Set of followed user IDs from the following list
  const followingIdsSet = useMemo(() => {
    return new Set(followingUsers.map((u) => u.id || u._id));
  }, [followingUsers]);

  // Handle follow / unfollow toggle
  const handleToggleFollow = (user: SuggestedUser) => {
    const targetId = user.id || user._id;
    if (!targetId) return;
    toggleFollowMutation.mutate({ userId: targetId, name: user.name || user.username });
  };

  // Filter posts based on search query or selected creator filter
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by selected creator if tapped in following bar
    if (selectedCreatorId) {
      result = result.filter((p) => {
        const uId = p.userId || p.author?.id || p.username;
        return uId === selectedCreatorId;
      });
    }

    // Filter by text search query
    if (query.trim()) {
      const q = query.toLowerCase().trim().replace(/^@/, "");
      result = result.filter((p) => {
        const u = (p.username || p.author?.username || "").toLowerCase();
        const n = (p.name || "").toLowerCase();
        const c = (p.content || "").toLowerCase();
        return u.includes(q) || n.includes(q) || c.includes(q);
      });
    }

    return result;
  }, [posts, query, selectedCreatorId]);

  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, page * PAGE_SIZE);
  }, [filteredPosts, page]);

  const hasMore = visiblePosts.length < filteredPosts.length;

  const handleRefresh = async () => {
    setPage(1);
    await Promise.all([refetchPosts(), refetchSuggestions(), refetchFollowing()]);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore || isPostsLoading) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  };

  // ─── Header: Search + Follow Suggestions + Following Creators Bar ──────────
  const listHeader = useMemo(() => {
    return (
      <View className="pt-2">
        {/* 1. Search Bar */}
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search creators or posts..."
          leftIcon={<Search size={18} color={colors.text3} />}
          clearable
          onClear={() => setQuery("")}
          inputHeight={44}
          containerClassName="px-4 mb-3"
        />

        {/* 2. Suggested Creators to Follow (Horizontal Cards Carousel) */}
        {suggestions.length > 0 && (
          <View className="mb-4">
            <View className="px-4 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Sparkles size={16} color={colors.brand} />
                <Text style={{ color: colors.text }} className="text-sm font-black">
                  Suggested for you
                </Text>
              </View>
              <Text style={{ color: colors.text3 }} className="text-xs font-semibold">
                {suggestions.length} new
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {suggestions.map((creator) => {
                const cId = creator.id || creator._id;
                const isFollowed = followingIdsSet.has(cId) || creator.isFollowing;
                const isMutating =
                  toggleFollowMutation.isPending &&
                  toggleFollowMutation.variables?.userId === cId;

                return (
                  <View
                    key={cId}
                    style={[
                      styles.suggestionCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : colors.border,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => router.push(`/(protected)/user/${cId}` as any)}
                      className="items-center"
                    >
                      <Avatar
                        src={creator.avatar || creator.avatarUrl}
                        size={52}
                        gradientBorder={true}
                        name={creator.name || creator.username}
                      />
                      <View className="flex-row items-center gap-1 mt-2 mb-0.5">
                        <Text
                          style={{ color: colors.text }}
                          className="text-xs font-bold text-center"
                          numberOfLines={1}
                        >
                          {creator.name || creator.username}
                        </Text>
                        {creator.verified && (
                          <BadgeCheck size={13} color="#FFFFFF" fill="#3B82F6" />
                        )}
                      </View>
                      <Text
                        style={{ color: colors.text3 }}
                        className="text-[11px] font-medium mb-3"
                        numberOfLines={1}
                      >
                        @{creator.username}
                      </Text>
                    </TouchableOpacity>

                    {/* Follow / Following Button */}
                    <TouchableOpacity
                      onPress={() => handleToggleFollow(creator)}
                      disabled={isMutating}
                      activeOpacity={0.8}
                      className="w-full"
                    >
                      {isFollowed ? (
                        <View
                          style={{
                            backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
                            borderColor: colors.border,
                          }}
                          className="py-1.5 px-3 rounded-full border items-center flex-row justify-center gap-1"
                        >
                          <UserCheck size={12} color={colors.text2} />
                          <Text
                            style={{ color: colors.text2 }}
                            className="text-[11px] font-bold"
                          >
                            Following
                          </Text>
                        </View>
                      ) : (
                        <LinearGradient
                          colors={Gradients.brand}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 20,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          <UserPlus size={12} color="#FFFFFF" />
                          <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                            Follow
                          </Text>
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 3. Following Creators Row */}
        {followingUsers.length > 0 && (
          <View className="mb-4">
            <View className="px-4 mb-2.5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Users size={16} color={colors.brand2} />
                <Text style={{ color: colors.text }} className="text-sm font-black">
                  Following ({followingUsers.length})
                </Text>
              </View>
              {selectedCreatorId && (
                <TouchableOpacity onPress={() => setSelectedCreatorId(null)}>
                  <Text style={{ color: colors.brand }} className="text-xs font-bold">
                    Show All
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
            >
              {followingUsers.map((user) => {
                const uId = user.id || user._id;
                const isSelected = selectedCreatorId === uId;

                return (
                  <TouchableOpacity
                    key={uId}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (selectedCreatorId === uId) {
                        setSelectedCreatorId(null);
                      } else {
                        setSelectedCreatorId(uId || null);
                      }
                    }}
                    className="items-center"
                    style={{ width: 62 }}
                  >
                    <View
                      style={{
                        padding: 2,
                        borderRadius: 30,
                        borderWidth: isSelected ? 2 : 1.5,
                        borderColor: isSelected ? colors.brand : (isDark ? "rgba(255,255,255,0.15)" : colors.border),
                      }}
                    >
                      <Avatar
                        src={user.avatar || user.avatarUrl}
                        size={46}
                        gradientBorder={isSelected}
                        name={user.name || user.username}
                      />
                    </View>
                    <Text
                      style={{ color: isSelected ? colors.brand : colors.text, fontWeight: isSelected ? "700" : "500" }}
                      className="text-[11px] text-center mt-1.5"
                      numberOfLines={1}
                    >
                      {user.name?.split(" ")[0] || user.username}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 4. Posts Feed Title Header */}
        <View
          style={{
            borderBottomColor: isDark ? "rgba(255, 255, 255, 0.08)" : colors.border,
            borderBottomWidth: 1,
            backgroundColor: colors.surface2,
          }}
          className="px-4 py-2.5 flex-row items-center justify-between"
        >
          <Text style={{ color: colors.text2 }} className="text-xs font-bold uppercase tracking-wider">
            {selectedCreatorId ? "Filtered Posts" : "Community Feed"}
          </Text>
          <Text style={{ color: colors.text3 }} className="text-xs font-medium">
            {filteredPosts.length} posts
          </Text>
        </View>
      </View>
    );
  }, [
    query,
    suggestions,
    followingUsers,
    followingIdsSet,
    selectedCreatorId,
    filteredPosts.length,
    colors,
    isDark,
    toggleFollowMutation.isPending,
    toggleFollowMutation.variables?.userId,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 📜 Seamless Stream Posts List */}
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
            refreshing={isPostsRefetching || isSuggestionsLoading || isFollowingLoading}
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
              <Text style={{ color: colors.text3 }} className="text-xs font-medium">
                You've seen all posts
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isPostsLoading ? (
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
                  : "Follow more creators above to see their latest posts!"}
              </Text>
              {(query.length > 0 || selectedCreatorId) && (
                <TouchableOpacity
                  onPress={() => {
                    setQuery("");
                    setSelectedCreatorId(null);
                  }}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                  className="px-4 py-2 rounded-lg border"
                >
                  <Text
                    style={{ color: colors.brand2 }}
                    className="text-xs font-semibold"
                  >
                    Reset Filter
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />

      {/* 💬 Comment Bottom Sheet */}
      {commentPost && (
        <CommentSheet
          post={commentPost}
          onClose={() => setCommentPost(null)}
        />
      )}

      {/* 🔗 Share Modal */}
      {sharePost && (
        <ShareModal
          post={sharePost}
          onClose={() => setSharePost(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionCard: {
    width: 130,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
});
