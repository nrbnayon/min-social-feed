import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import type { Post } from "@/types";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { PostCard } from "@/components/feed/PostCard";
import { CommentSheet } from "@/components/comments/CommentSheet";
import { ShareModal } from "@/components/feed/ShareModal";
import { Avatar } from "@/components/Shared/Avatar";
import { Input } from "@/components/ui/input";
import { Gradients } from "@/constants/theme";
import { appShadow } from "@/lib/utils";
import {
  Bell,
  Search,
  SearchX,
  CheckCircle2,
  SquarePen,
} from "lucide-react-native";

const PAGE_SIZE = 5;

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const {
    posts,
    notifications,
    isLoading,
    refresh,
  } = usePostsStore();
  const currentUser = useAuth((s) => s.user);

  // Active Feed Tab: "forYou" | "following"
  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state (infinite scroll)
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  // Reset pagination when active tab or search query changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  // Compute unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Filtered posts based on activeTab & searchQuery
  const filteredPosts = useMemo(() => {
    let result = posts;

    if (activeTab === "following") {
      result = result.filter(
        (p) => (p.likes || []).length > 0 || p.userId !== currentUser?.id
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase().replace(/^@/, "");
      result = result.filter((p) => {
        const u = (p.username || p.author?.username || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const content = (p.content || "").toLowerCase();
        return u.includes(q) || name.includes(q) || content.includes(q);
      });
    }

    return result;
  }, [posts, activeTab, searchQuery, currentUser]);

  // Paginated visible posts for infinite scroll
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, page * PAGE_SIZE);
  }, [filteredPosts, page]);

  const hasMore = visiblePosts.length < filteredPosts.length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 350);
  };

  // Scrollable Header that scrolls naturally with the feed
  const listHeader = useMemo(
    () => (
      <View className="pt-2">
        {/* 1. Search Bar */}
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search posts or users..."
          leftIcon={<Search size={18} color={colors.text3} />}
          clearable
          onClear={() => setSearchQuery("")}
          inputHeight={44}
          containerClassName="px-4 mb-2"
        />

        {/* 2. Small Left-Aligned Text Format Tabs: For You / Following */}
        <View className="px-5 mb-2.5 flex-row items-center gap-6">
          {/* For you */}
          <TouchableOpacity
            onPress={() => setActiveTab("forYou")}
            activeOpacity={0.7}
            className="py-1 items-center"
          >
            <Text
              style={{
                color:
                  activeTab === "forYou"
                    ? isDark
                      ? "#FFFFFF"
                      : colors.text
                    : colors.text3,
                fontSize: 13.5,
                fontWeight: activeTab === "forYou" ? "800" : "500",
              }}
            >
              For you
            </Text>
            {activeTab === "forYou" && (
              <View
                style={{
                  backgroundColor: colors.brand,
                  height: 2.5,
                  borderRadius: 2,
                  marginTop: 3,
                  width: "100%",
                }}
              />
            )}
          </TouchableOpacity>

          {/* Following */}
          <TouchableOpacity
            onPress={() => setActiveTab("following")}
            activeOpacity={0.7}
            className="py-1 items-center"
          >
            <Text
              style={{
                color:
                  activeTab === "following"
                    ? isDark
                      ? "#FFFFFF"
                      : colors.text
                    : colors.text3,
                fontSize: 13.5,
                fontWeight: activeTab === "following" ? "800" : "500",
              }}
            >
              Following
            </Text>
            {activeTab === "following" && (
              <View
                style={{
                  backgroundColor: colors.brand,
                  height: 2.5,
                  borderRadius: 2,
                  marginTop: 3,
                  width: "100%",
                }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* 3. Quick Create Post Entry Card */}
        <TouchableOpacity
          onPress={() => router.push("/(protected)/create-post" as any)}
          activeOpacity={0.85}
          style={{
            backgroundColor: colors.surface,
            borderColor: isDark ? "rgba(99, 102, 241, 0.22)" : colors.border,
          }}
          className={`mx-4 mb-2.5 p-3 rounded-2xl border flex-row items-center justify-between ${appShadow}`}
        >
          <View className="flex-row items-center flex-1 mr-3">
            <Avatar
              src={currentUser?.avatar}
              size={38}
              gradientBorder={true}
              name={currentUser?.name || "User"}
            />
            <Text
              style={{ color: colors.text3 }}
              className="text-xs font-medium ml-3 flex-1"
              numberOfLines={1}
            >
              What's on your mind, {currentUser?.name?.split(" ")[0] || "there"}?
            </Text>
          </View>

          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7.5,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12.5, fontWeight: "700" }}>
              Post
            </Text>
            <SquarePen size={13} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    ),
    [searchQuery, activeTab, colors, isDark, currentUser]
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* 🌟 1. Top Navigation Header */}
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
        {/* Left: App Logo + Name */}
        <View className="flex-row items-center">
          <Image
            source={require("@/assets/images/app-logo.png")}
            style={{ width: 34, height: 34, borderRadius: 8 }}
            resizeMode="contain"
          />
          <Text
            style={{ color: colors.text }}
            className="text-xl font-black tracking-tight ml-2.5"
          >
            MiniSocial
          </Text>
        </View>

        {/* Right: Notifications Bell + Profile Avatar */}
        <View className="flex-row items-center gap-3.5">
          {/* Bell Icon for Notifications */}
          <TouchableOpacity
            onPress={() => router.push("/(protected)/notifications")}
            activeOpacity={0.7}
            className="relative p-1.5"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bell size={22} color={colors.text} />
            {unreadNotificationsCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: colors.pink,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 3,
                  borderWidth: 1.5,
                  borderColor: colors.background,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 9,
                    fontWeight: "800",
                  }}
                >
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Avatar Icon */}
          <TouchableOpacity
            onPress={() =>
              router.push(`/(protected)/user/${currentUser?.id || "u0"}` as any)
            }
            activeOpacity={0.7}
          >
            <Avatar
              src={currentUser?.avatar}
              size={34}
              gradientBorder={true}
              name={currentUser?.name || "User"}
              onPress={() =>
                router.push(`/(protected)/user/${currentUser?.id || "u0"}` as any)
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 📜 Feed Posts List with Natural Scrollable Header, Pull-to-Refresh & Infinite Scroll */}
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
            refreshing={isRefreshing}
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
                You're all caught up
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !isRefreshing ? (
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
                {searchQuery
                  ? `No posts matching "${searchQuery}".`
                  : "No posts available in this feed yet."}
              </Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
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
          ) : null
        }
      />

      {/* 💬 Comments Bottom Sheet Modal */}
      {commentPost && (
        <CommentSheet
          post={commentPost}
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
