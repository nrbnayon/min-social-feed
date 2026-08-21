import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import type { Post, Story } from "@/types";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { useAuth } from "@/store/auth.store";
import { PostCard } from "@/components/feed/PostCard";
import { StoryViewerModal } from "@/components/feed/StoryViewerModal";
import { CommentSheet } from "@/components/comments/CommentSheet";
import { ShareModal } from "@/components/feed/ShareModal";
import { Avatar } from "@/components/Shared/Avatar";
import { Gradients } from "@/constants/theme";
import {
  MessageSquare,
  Sparkles,
  Sun,
  Moon,
  Image as ImageIcon,
  Send,
} from "lucide-react-native";

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const {
    posts,
    stories,
    isLoading,
    refresh,
    createPost,
    markStorySeen,
  } = usePostsStore();
  const currentUser = useAuth((s) => s.user);

  const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");
  const [composeText, setComposeText] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  // Modals state
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  const handleStoryPress = (story: Story) => {
    markStorySeen(story.id);
    setSelectedStory(story);
  };

  const handleQuickPost = async () => {
    if (!composeText.trim()) return;
    await createPost(composeText.trim(), ["Feed"], undefined, currentUser);
    setComposeText("");
    setIsComposing(false);
  };

  const displayPosts =
    activeTab === "following"
      ? posts.filter((p) => (p.likes || []).length > 0 || p.userId !== currentUser?.id)
      : posts;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* 1. Top Bar */}
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
        <View style={styles.brandingRow}>
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerLogo}
          >
            <MessageSquare size={18} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            MiniSocial
          </Text>
        </View>

        <Pressable
          onPress={toggleTheme}
          style={[
            styles.themeToggleBtn,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.border,
            },
          ]}
          hitSlop={8}
        >
          {isDark ? (
            <Sun size={17} color={colors.yellow} />
          ) : (
            <Moon size={17} color={colors.brand} />
          )}
        </Pressable>
      </View>

      {/* 2. Stories Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
        style={[
          styles.storiesScroll,
          {
            borderBottomColor: colors.border,
            backgroundColor: isDark ? "#0F111A" : "#F1F5F9",
          },
        ]}
      >
        {stories.map((story) => {
          const isYourStory = story.userId === currentUser?.id || story.id === "s0";
          return (
            <Pressable
              key={story.id}
              onPress={() => handleStoryPress(story)}
              style={styles.storyItem}
            >
              <View style={styles.storyAvatarWrapper}>
                <Avatar
                  src={isYourStory ? currentUser?.avatar : story.avatar}
                  size={56}
                  ring
                  seen={story.seen}
                  name={story.username}
                />
                {isYourStory && (
                  <LinearGradient
                    colors={Gradients.brand}
                    style={styles.storyPlusBadge}
                  >
                    <Text style={styles.storyPlusText}>+</Text>
                  </LinearGradient>
                )}
              </View>
              <Text
                style={[
                  styles.storyUsername,
                  { color: story.seen ? colors.text3 : colors.text },
                ]}
                numberOfLines={1}
              >
                {isYourStory ? "Your Story" : story.username}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 3. Feed Tab Switcher */}
      <View style={[styles.feedTabs, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => setActiveTab("forYou")}
          style={[
            styles.feedTabBtn,
            activeTab === "forYou" && { borderBottomColor: colors.brand, borderBottomWidth: 2.5 },
          ]}
        >
          <Text
            style={[
              styles.feedTabText,
              {
                color: activeTab === "forYou" ? colors.text : colors.text3,
                fontWeight: activeTab === "forYou" ? "700" : "500",
              },
            ]}
          >
            For You
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("following")}
          style={[
            styles.feedTabBtn,
            activeTab === "following" && { borderBottomColor: colors.brand, borderBottomWidth: 2.5 },
          ]}
        >
          <Text
            style={[
              styles.feedTabText,
              {
                color: activeTab === "following" ? colors.text : colors.text3,
                fontWeight: activeTab === "following" ? "700" : "500",
              },
            ]}
          >
            Following
          </Text>
        </Pressable>
      </View>

      {/* 4. Quick Compose Bar */}
      <View
        style={[
          styles.composeBar,
          {
            backgroundColor: colors.surface,
            borderColor: isComposing ? colors.brand : colors.border,
          },
        ]}
      >
        <View style={styles.composeRow}>
          <Avatar src={currentUser?.avatar} size={38} name={currentUser?.name} />
          <TextInput
            value={composeText}
            onChangeText={setComposeText}
            onFocus={() => setIsComposing(true)}
            placeholder="What's happening?"
            placeholderTextColor={colors.text3}
            multiline={isComposing}
            style={[styles.composeInput, { color: colors.text }]}
          />
        </View>

        {(isComposing || composeText.length > 0) && (
          <View style={[styles.composeActions, { borderTopColor: colors.border }]}>
            <View style={styles.composeTools}>
              <Pressable style={styles.toolBtn}>
                <ImageIcon size={18} color={colors.brand2} />
              </Pressable>
              <Pressable style={styles.toolBtn}>
                <Sparkles size={18} color={colors.brand2} />
              </Pressable>
            </View>

            <View style={styles.composeSubmitRow}>
              <Text
                style={[
                  styles.charCount,
                  {
                    color:
                      composeText.length > 250
                        ? colors.pink
                        : colors.text3,
                  },
                ]}
              >
                {280 - composeText.length}
              </Text>

              <Pressable
                onPress={handleQuickPost}
                disabled={!composeText.trim()}
                style={[
                  styles.postSubmitBtn,
                  {
                    backgroundColor: composeText.trim() ? colors.brand : colors.surface2,
                    opacity: composeText.trim() ? 1 : 0.6,
                  },
                ]}
              >
                <Text style={styles.postSubmitText}>Post</Text>
              </Pressable>
            </View>
          </View>
        )}
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
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onCommentPress={(p) => setCommentPost(p)}
            onSharePress={(p) => setSharePost(p)}
          />
        )}
      />

      {/* Modals */}
      <StoryViewerModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />

      <CommentSheet
        post={commentPost}
        onClose={() => setCommentPost(null)}
      />

      <ShareModal
        post={sharePost}
        onClose={() => setSharePost(null)}
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
  headerContainer: {
    marginBottom: 12,
    marginHorizontal: -14,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  storiesScroll: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  storiesContent: {
    paddingHorizontal: 14,
    gap: 14,
  },
  storyItem: {
    alignItems: "center",
    width: 66,
  },
  storyAvatarWrapper: {
    position: "relative",
  },
  storyPlusBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#090A12",
  },
  storyPlusText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 12,
  },
  storyUsername: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
  },
  feedTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  feedTabBtn: {
    paddingVertical: 12,
    marginRight: 24,
  },
  feedTabText: {
    fontSize: 14.5,
  },
  composeBar: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  composeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  composeInput: {
    flex: 1,
    fontSize: 14,
    minHeight: 36,
  },
  composeActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 8,
  },
  composeTools: {
    flexDirection: "row",
    gap: 10,
  },
  toolBtn: {
    padding: 6,
  },
  composeSubmitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  charCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  postSubmitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  postSubmitText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
