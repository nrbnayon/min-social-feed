import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share as NativeShare,
} from "react-native";
import { useLocalSearchParams, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import type { User, Post } from "@/types";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsQuery } from "@/hooks/usePostsQuery";
import { useFollowingQuery, useToggleFollowMutation } from "@/hooks/useUsersQuery";
import { useAuth } from "@/store/auth.store";
import { useToastStore } from "@/store/useToastStore";
import { PostCard } from "@/components/feed/PostCard";
import { Avatar } from "@/components/Shared/Avatar";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CommentSheet } from "@/components/comments/CommentSheet";
import { ShareModal } from "@/components/feed/ShareModal";
import { Gradients } from "@/constants/theme";
import { formatCount, appShadow } from "@/lib/utils";
import {
  MapPin,
  Globe,
  Calendar,
  Share2,
  BadgeCheck,
  UserPlus,
  UserCheck,
  Settings,
} from "lucide-react-native";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const currentUser = useAuth((s) => s.user);
  const { data: postsData } = usePostsQuery();
  const { data: followingUsers = [] } = useFollowingQuery();
  const toggleFollowMutation = useToggleFollowMutation();
  const posts = postsData?.items ?? [];
  const showToast = useToastStore((s) => s.showToast);

  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  // 1. Resolve User Object
  const targetUser: User | null = useMemo(() => {
    if (!id) return null;
    const cleanId = id.replace(/^@/, "");

    // Check Current User
    if (currentUser && (currentUser.id === id || currentUser.username === cleanId)) {
      return currentUser as User;
    }

    // Search inside posts
    const postWithUser = posts.find(
      (p) =>
        p.userId === id ||
        (p.username || "").toLowerCase().replace(/^@/, "") === cleanId.toLowerCase() ||
        (p.author?.id && p.author.id === id) ||
        (p.author?.username || "").toLowerCase().replace(/^@/, "") === cleanId.toLowerCase()
    );

    if (postWithUser) {
      return {
        id: postWithUser.userId || postWithUser.author?.id || id,
        name: postWithUser.name || postWithUser.author?.username || cleanId,
        username: (postWithUser.username || postWithUser.author?.username || cleanId).replace(/^@/, ""),
        email: `${cleanId}@example.com`,
        avatar: postWithUser.avatar || postWithUser.author?.avatarUrl || "",
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop&auto=format",
        bio: `Content creator and active community contributor on MiniSocial ✨`,
        location: "Community Member",
        followers: 1420,
        following: 280,
        verified: postWithUser.verified || false,
        joinedDate: "2024",
      };
    }

    return null;
  }, [id, currentUser, posts]);

  // 2. Resolve User's Posts
  const userPosts = useMemo(() => {
    if (!targetUser) return [];
    const uName = targetUser.username.toLowerCase();
    const uId = targetUser.id;

    return posts.filter(
      (p) =>
        p.userId === uId ||
        (p.username || "").toLowerCase().replace(/^@/, "") === uName ||
        (p.author?.id && p.author.id === uId) ||
        (p.author?.username || "").toLowerCase().replace(/^@/, "") === uName
    );
  }, [posts, targetUser]);

  const isSelf = currentUser && targetUser && (currentUser.id === targetUser.id || currentUser.username === targetUser.username);

  const isFollowing = useMemo(() => {
    if (!targetUser) return false;
    const tId = targetUser.id;
    return followingUsers.some((u) => (u.id || u._id) === tId);
  }, [targetUser, followingUsers]);

  const handleFollowToggle = () => {
    if (!targetUser) return;
    const tId = targetUser.id;
    toggleFollowMutation.mutate({ userId: tId, name: targetUser.name });
  };

  const handleShareProfile = () => {
    if (!targetUser) return;
    NativeShare.share({
      message: `Check out @${targetUser.username}'s profile on MiniSocial!`,
    }).catch(() => { });
  };

  if (!targetUser) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 8 }}>
        <View className="px-4 pb-3 flex-row items-center justify-between border-b border-border">
          <BackButton onPress={() => router.back()} />
          <Text style={{ color: colors.text }} className="text-lg font-bold">
            Profile
          </Text>
          <View style={{ width: 38 }} />
        </View>
        <EmptyState
          icon="👤"
          title="User not found"
          description="This user profile doesn't exist or has been removed."
        />
      </View>
    );
  }

  const followersCount = (targetUser.followers || 0) + (isFollowing ? 1 : 0);

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* 1. Cover Photo */}
      <View style={styles.coverContainer}>
        {targetUser.coverImage ? (
          <Image
            source={{ uri: targetUser.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverImage}
          />
        )}
        <View
          style={[
            styles.coverOverlay,
            { backgroundColor: isDark ? "rgba(9, 10, 18, 0.4)" : "rgba(0, 0, 0, 0.15)" },
          ]}
        />
      </View>

      {/* 2. Avatar & Action Buttons Row */}
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrapper}>
          <Avatar
            src={targetUser.avatar}
            size={86}
            gradientBorder={true}
            name={targetUser.name}
          />
        </View>

        <View style={styles.actionButtonsGroup}>
          {!isSelf ? (
            <TouchableOpacity
              onPress={handleFollowToggle}
              activeOpacity={0.85}
              style={{
                backgroundColor: isFollowing ? colors.surface2 : colors.brand,
                borderColor: isFollowing ? colors.border : colors.brand,
              }}
              className={`px-5 py-2.5 rounded-full border flex-row items-center gap-1.5 ${appShadow}`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={16} color={colors.text2} />
                  <Text
                    style={{ color: colors.text2 }}
                    className="text-xs font-bold"
                  >
                    Following
                  </Text>
                </>
              ) : (
                <>
                  <UserPlus size={16} color="#FFFFFF" />
                  <Text className="text-xs font-bold text-white">
                    Follow
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/(protected)/setting" as Href)}
              activeOpacity={0.85}
              style={{
                backgroundColor: colors.surface2,
                borderColor: colors.border,
              }}
              className={`px-4 py-2.5 rounded-full border flex-row items-center gap-1.5 ${appShadow}`}
            >
              <Settings size={14} color={colors.text2} />
              <Text style={{ color: colors.text }} className="text-xs font-bold">
                Settings
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. User Identity & Bio */}
      <View style={styles.profileInfo}>
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Text
            style={[styles.displayName, { color: colors.text }]}
            numberOfLines={1}
          >
            {targetUser.name}
          </Text>
          {targetUser.verified && (
            <BadgeCheck size={18} color="#FFFFFF" fill="#3B82F6" strokeWidth={2.5} />
          )}
        </View>

        <Text style={[styles.handle, { color: colors.text3 }]}>
          @{targetUser.username}
        </Text>

        {targetUser.bio ? (
          <Text style={[styles.bio, { color: colors.text }]}>
            {targetUser.bio}
          </Text>
        ) : null}

        {/* Metadata Details */}
        <View style={styles.metaRow}>
          {targetUser.location ? (
            <View style={styles.metaItem}>
              <MapPin size={13} color={colors.text3} />
              <Text style={[styles.metaText, { color: colors.text2 }]}>
                {targetUser.location}
              </Text>
            </View>
          ) : null}

          {targetUser.website ? (
            <View style={styles.metaItem}>
              <Globe size={13} color={colors.brand2} />
              <Text style={[styles.metaText, { color: colors.brand2 }]}>
                {targetUser.website}
              </Text>
            </View>
          ) : null}

          <View style={styles.metaItem}>
            <Calendar size={13} color={colors.text3} />
            <Text style={[styles.metaText, { color: colors.text3 }]}>
              Joined {targetUser.joinedDate || "2024"}
            </Text>
          </View>
        </View>

        {/* 4. Stats Counter Card */}
        <View
          style={[
            styles.statsBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: colors.brand2 }]}>
              {userPosts.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text3 }]}>
              Posts
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: colors.brand2 }]}>
              {formatCount(followersCount)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text3 }]}>
              Followers
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: colors.brand2 }]}>
              {formatCount(targetUser.following || 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text3 }]}>
              Following
            </Text>
          </View>
        </View>

        {/* Section title */}
        <View className="mt-5 mb-3 flex-row items-center justify-between">
          <Text
            style={{ color: colors.text }}
            className="text-sm font-bold tracking-tight"
          >
            Posts ({userPosts.length})
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          {targetUser.name}
        </Text>
        <TouchableOpacity
          onPress={handleShareProfile}
          activeOpacity={0.7}
          className="p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Share2 size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* 📜 Posts List */}
      <FlatList
        data={userPosts}
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
          paddingBottom: insets.bottom + 60,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="px-6 py-12 items-center">
            <Text
              style={{ color: colors.text3 }}
              className="text-sm text-center"
            >
              No posts from @{targetUser.username} yet.
            </Text>
          </View>
        }
      />

      {/* Modals */}
      {commentPost && (
        <CommentSheet
          post={commentPost}
          onClose={() => setCommentPost(null)}
        />
      )}
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
  headerArea: {
    width: "100%",
  },
  coverContainer: {
    width: "100%",
    height: 120,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -44,
    marginBottom: 10,
  },
  avatarWrapper: {
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "transparent",
  },
  actionButtonsGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  profileInfo: {
    paddingHorizontal: 20,
  },
  displayName: {
    fontSize: 18,
    fontWeight: "800",
  },
  handle: {
    fontSize: 13,
    marginBottom: 8,
  },
  bio: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  statsBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 24,
  },
});
