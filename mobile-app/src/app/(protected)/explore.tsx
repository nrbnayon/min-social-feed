import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { User, Post } from "@/types";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useToastStore } from "@/store/useToastStore";
import { PostCard } from "@/components/feed/PostCard";
import { Avatar } from "@/components/Shared/Avatar";
import { TRENDING_TAGS, SUGGESTED_USERS } from "@/data/seed";
import { Search, X, Flame, Sparkles } from "lucide-react-native";

const CATEGORIES = ["All", "Tech", "Design", "Travel", "Startup", "AI", "Photography"];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const posts = usePostsStore((s) => s.posts);
  const showToast = useToastStore((s) => s.showToast);

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  const handleFollowToggle = (user: User) => {
    const isNowFollowing = !followedIds.includes(user.id);
    setFollowedIds((prev) =>
      isNowFollowing ? [...prev, user.id] : prev.filter((id) => id !== user.id)
    );
    if (isNowFollowing) {
      showToast(`Following ${user.name}`, "✓");
    }
  };

  const filteredPosts = posts.filter((p) => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.content.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q));

    const matchesCat =
      selectedCat === "All" ||
      (p.tags || []).some((t) => t.toLowerCase().includes(selectedCat.toLowerCase())) ||
      p.content.toLowerCase().includes(selectedCat.toLowerCase());

    return matchesQuery && matchesCat;
  });

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* 1. Title & Search Input */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + (Platform.OS === "ios" ? 4 : 10),
            backgroundColor: isDark ? "rgba(9, 10, 18, 0.92)" : "rgba(248, 250, 252, 0.92)",
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>
          Explore
        </Text>

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.borderStrong,
            },
          ]}
        >
          <Search size={17} color={colors.text3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search posts, tags, or creators..."
            placeholderTextColor={colors.text3}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
              <X size={14} color={colors.text2} />
            </Pressable>
          )}
        </View>
      </View>

      {/* 2. Category Chips */}
      {!query && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          style={[styles.categoryContainer, { borderBottomColor: colors.border }]}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCat(cat)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isActive
                      ? isDark
                        ? "rgba(99, 102, 241, 0.25)"
                        : "rgba(99, 102, 241, 0.15)"
                      : colors.surface2,
                    borderColor: isActive ? colors.brand : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    {
                      color: isActive ? colors.brand2 : colors.text2,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* 3. Trending Topics */}
      {!query && (
        <View style={styles.trendingSection}>
          <View style={styles.sectionTitleRow}>
            <Flame size={18} color={colors.pink} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Trending Topics
            </Text>
          </View>

          <View style={styles.trendingGrid}>
            {TRENDING_TAGS.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => setQuery(item.tag)}
                style={[
                  styles.trendingCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.trendingTag, { color: colors.text }]}>
                  #{item.tag}
                </Text>
                <Text style={[styles.trendingCount, { color: colors.text3 }]}>
                  {item.posts} posts
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* 4. Suggested Creators */}
      {!query && (
        <View style={styles.creatorsSection}>
          <View style={styles.sectionTitleRow}>
            <Sparkles size={18} color={colors.brand2} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Suggested Creators
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.creatorsScroll}
          >
            {SUGGESTED_USERS.map((user) => {
              const isFollowing = followedIds.includes(user.id);
              return (
                <View
                  key={user.id}
                  style={[
                    styles.creatorCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Avatar
                    src={user.avatar}
                    size={52}
                    name={user.name}
                    verified={user.verified}
                  />
                  <Text style={[styles.creatorName, { color: colors.text }]} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={[styles.creatorUsername, { color: colors.text3 }]} numberOfLines={1}>
                    @{user.username}
                  </Text>

                  <Pressable
                    onPress={() => handleFollowToggle(user)}
                    style={[
                      styles.followBtn,
                      {
                        backgroundColor: isFollowing
                          ? colors.surface2
                          : colors.brand,
                        borderColor: isFollowing
                          ? colors.borderStrong
                          : colors.brand,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.followBtnText,
                        {
                          color: isFollowing ? colors.text : "#FFFFFF",
                        },
                      ]}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Discover Posts Section Heading */}
      <View style={styles.discoverHeadingRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {query ? `Results for "${query}"` : "Discover Posts"}
        </Text>
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
        data={filteredPosts}
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
              No posts found matching your search.
            </Text>
          </View>
        }
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
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  catChipText: {
    fontSize: 13,
  },
  trendingSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  trendingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  trendingCard: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  trendingTag: {
    fontSize: 14,
    fontWeight: "700",
  },
  trendingCount: {
    fontSize: 11,
    marginTop: 3,
  },
  creatorsSection: {
    paddingTop: 18,
  },
  creatorsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  creatorCard: {
    width: 130,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  creatorName: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  creatorUsername: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
    textAlign: "center",
  },
  followBtn: {
    width: "100%",
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  discoverHeadingRow: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
