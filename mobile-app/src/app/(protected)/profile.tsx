import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import type { Post } from "@/types";
import { useAppTheme, ThemeMode } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { PostCard } from "@/components/feed/PostCard";
import { Avatar } from "@/components/Shared/Avatar";
import { LogoutModal } from "@/components/Shared/LogoutModal";
import { Gradients } from "@/constants/theme";
import { formatCount } from "@/lib/utils";
import {
  MapPin,
  Globe,
  Calendar,
  Settings,
  LogOut,
  Moon,
  Sun,
  Laptop,
} from "lucide-react-native";

type ProfileTab = "posts" | "liked" | "bookmarks";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, mode, setMode } = useAppTheme();
  const { user, logout } = useAuth();
  const posts = usePostsStore((s) => s.posts);

  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userId = user?.id || "u0";

  const userPosts = posts.filter((p) => p.userId === userId);
  const likedPosts = posts.filter((p) => (p.likes || []).includes(userId));
  const bookmarkedPosts = posts.filter((p) => (p.bookmarks || []).includes(userId));

  const displayPosts =
    activeTab === "posts"
      ? userPosts
      : activeTab === "liked"
      ? likedPosts
      : bookmarkedPosts;

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace("/(auth)/login");
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* 1. Cover Image */}
      <View style={styles.coverContainer}>
        {user?.coverImage ? (
          <Image
            source={{ uri: user.coverImage }}
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
            src={user?.avatar}
            size={76}
            verified={user?.verified}
            name={user?.name}
          />
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowLogoutModal(true)}
            style={[
              styles.actionIconBtn,
              {
                backgroundColor: colors.surface2,
                borderColor: colors.border,
              },
            ]}
          >
            <LogOut size={17} color={colors.pink} />
          </Pressable>
        </View>
      </View>

      {/* 3. User Bio & Details */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name || "Jordan Ellis"}
          </Text>
          {user?.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>

        <Text style={[styles.username, { color: colors.text3 }]}>
          @{user?.username || "jordanellis"}
        </Text>

        <Text style={[styles.bio, { color: colors.text }]}>
          {user?.bio || "Designer & developer. Building things I wish existed. 🚀"}
        </Text>

        {/* Meta badges */}
        <View style={styles.metaRow}>
          {user?.location ? (
            <View style={styles.metaItem}>
              <MapPin size={14} color={colors.text3} />
              <Text style={[styles.metaText, { color: colors.text2 }]}>
                {user.location}
              </Text>
            </View>
          ) : null}

          {user?.website ? (
            <View style={styles.metaItem}>
              <Globe size={14} color={colors.brand2} />
              <Text style={[styles.metaText, { color: colors.brand2 }]}>
                {user.website}
              </Text>
            </View>
          ) : null}

          <View style={styles.metaItem}>
            <Calendar size={14} color={colors.text3} />
            <Text style={[styles.metaText, { color: colors.text3 }]}>
              Joined {user?.joinedDate || "March 2022"}
            </Text>
          </View>
        </View>

        {/* 4. Stats Counter */}
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
              {formatCount(user?.followers || 1248)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text3 }]}>
              Followers
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: colors.brand2 }]}>
              {formatCount(user?.following || 394)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text3 }]}>
              Following
            </Text>
          </View>
        </View>

        {/* 5. Theme Mode Switcher */}
        <View
          style={[
            styles.themeSwitcher,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.themeLabel, { color: colors.text2 }]}>
            Appearance
          </Text>

          <View style={[styles.themeTabs, { backgroundColor: colors.surface2 }]}>
            {(["dark", "light", "system"] as ThemeMode[]).map((m) => {
              const isActive = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.themeTabBtn,
                    isActive && {
                      backgroundColor: isDark ? "#252B40" : "#FFFFFF",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    },
                  ]}
                >
                  {m === "dark" ? (
                    <Moon size={14} color={isActive ? colors.brand2 : colors.text3} />
                  ) : m === "light" ? (
                    <Sun size={14} color={isActive ? colors.yellow : colors.text3} />
                  ) : (
                    <Laptop size={14} color={isActive ? colors.brand2 : colors.text3} />
                  )}
                  <Text
                    style={[
                      styles.themeTabText,
                      {
                        color: isActive ? colors.text : colors.text3,
                        fontWeight: isActive ? "700" : "500",
                      },
                    ]}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 6. Tabs */}
        <View style={[styles.profileTabs, { borderBottomColor: colors.border }]}>
          {(["posts", "liked", "bookmarks"] as ProfileTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const label =
              tab === "posts"
                ? `Posts (${userPosts.length})`
                : tab === "liked"
                ? `Liked (${likedPosts.length})`
                : `Saved (${bookmarkedPosts.length})`;

            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.profileTabBtn,
                  isActive && {
                    borderBottomColor: colors.brand,
                    borderBottomWidth: 2.5,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.profileTabText,
                    {
                      color: isActive ? colors.text : colors.text3,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#090A12" : "#F8FAFC" },
      ]}
    >
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id || item._id || ""}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PostCard post={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text3 }]}>
              {activeTab === "posts"
                ? "You haven't posted anything yet."
                : activeTab === "liked"
                ? "No liked posts yet."
                : "No saved posts yet."}
            </Text>
          </View>
        }
      />

      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 14,
  },
  headerArea: {
    marginHorizontal: -14,
    marginBottom: 12,
  },
  coverContainer: {
    width: "100%",
    height: 140,
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
    paddingHorizontal: 16,
    marginTop: -38,
    marginBottom: 12,
  },
  avatarWrapper: {
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#090A12",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    paddingHorizontal: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
  },
  username: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
  },
  statsBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  themeSwitcher: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 18,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  themeTabs: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
  },
  themeTabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: 9,
    gap: 6,
  },
  themeTabText: {
    fontSize: 12,
  },
  profileTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    gap: 20,
  },
  profileTabBtn: {
    paddingVertical: 10,
  },
  profileTabText: {
    fontSize: 13.5,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
