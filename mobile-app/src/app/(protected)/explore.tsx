import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { User, Post } from "@/types";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useToastStore } from "@/store/useToastStore";
import { PostCard } from "@/components/feed/PostCard";
import { Avatar } from "@/components/Shared/Avatar";
import { Input } from "@/components/ui/input";
import { CommentSheet } from "@/components/comments/CommentSheet";
import { ShareModal } from "@/components/feed/ShareModal";
import { SUGGESTED_USERS } from "@/data/seed";
import {
  Search,
  Users,
  SearchX,
  BadgeCheck,
  TrendingUp,
} from "lucide-react-native";

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const posts = usePostsStore((s) => s.posts);
  const showToast = useToastStore((s) => s.showToast);

  const [query, setQuery] = useState("");
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  // Modals state
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  const handleFollowToggle = (user: User) => {
    const isNowFollowing = !followedIds.includes(user.id);
    setFollowedIds((prev) =>
      isNowFollowing ? [...prev, user.id] : prev.filter((id) => id !== user.id)
    );
    showToast(
      isNowFollowing ? `Following ${user.name} 🎉` : `Unfollowed ${user.name}`,
      isNowFollowing ? "✓" : "👋"
    );
  };

  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase().trim().replace(/^@/, "");
    if (!q) return posts;

    return posts.filter((p) => {
      const content = (p.content || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      const username = (p.username || "").toLowerCase().replace(/^@/, "");
      return content.includes(q) || name.includes(q) || username.includes(q);
    });
  }, [posts, query]);

  const renderHeader = () => (
    <View className="pt-2">
      {/* 1. Reusable Search Input */}
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search creators, handles, or posts..."
        leftIcon={<Search size={18} color={colors.text3} />}
        clearable
        onClear={() => setQuery("")}
        inputHeight={46}
        containerClassName="px-4 mb-4"
      />

      {/* 2. Suggested Creators Section */}
      <View className="mb-5">
        <View className="px-4 mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Users size={16} color={colors.brand2} />
            <Text
              style={{ color: colors.text }}
              className="text-sm font-bold tracking-tight"
            >
              Suggested Creators
            </Text>
          </View>
          {/* <Text
            style={{ color: colors.text3 }}
            className="text-xs font-semibold"
          >
            {SUGGESTED_USERS.length} Discover
          </Text> */}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 10 }}
        >
          {SUGGESTED_USERS.map((user) => {
            const isFollowing = followedIds.includes(user.id);
            return (
              <View
                key={user.id}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: isDark ? "rgba(99, 102, 241, 0.22)" : colors.border,
                  width: 148,
                }}
                className="p-3.5 rounded-2xl border items-center shadow-xs"
              >
                <Avatar
                  src={user.avatar}
                  size={50}
                  gradientBorder={true}
                  name={user.name}
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
                  onPress={() => handleFollowToggle(user)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: isFollowing ? colors.surface2 : colors.brand,
                    borderColor: isFollowing ? colors.border : colors.brand,
                  }}
                  className="w-full py-1.5 rounded-lg border items-center justify-center"
                >
                  <Text
                    style={{
                      color: isFollowing ? colors.text2 : "#FFFFFF",
                      fontSize: 11.5,
                      fontWeight: "700",
                    }}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Feed Header Section */}
      <View className="px-4 mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <TrendingUp size={16} color={colors.brand2} />
          <Text
            style={{ color: colors.text }}
            className="text-sm font-bold tracking-tight"
          >
            {query ? `Search Results (${filteredPosts.length})` : "Recent Community Posts"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* 🌟 Top Header */}
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

      {/* 📜 Feed List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id || item._id || String(Math.random())}
        ListHeaderComponent={renderHeader}
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
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
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
              No results found for "{query}". Try a different keyword or creator.
            </Text>
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery("")}
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
                  Clear Search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* 💬 Comments Bottom Sheet Modal */}
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
