import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Notification } from "@/types";
import { useAppTheme } from "@/context/ThemeContext";
import { usePostsStore } from "@/hooks/usePosts";
import { Avatar } from "@/components/Shared/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Heart,
  MessageCircle,
  UserPlus,
  Repeat,
  AtSign,
  CheckCheck,
} from "lucide-react-native";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { notifications, markNotificationsRead } = usePostsStore();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const getNotifIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart size={14} color="#FFF" fill="#FFF" />;
      case "comment":
        return <MessageCircle size={14} color="#FFF" fill="#FFF" />;
      case "follow":
        return <UserPlus size={14} color="#FFF" />;
      case "repost":
        return <Repeat size={14} color="#FFF" />;
      case "mention":
        return <AtSign size={14} color="#FFF" />;
      default:
        return <Heart size={14} color="#FFF" />;
    }
  };

  const getNotifColor = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return colors.pink;
      case "comment":
        return colors.brand;
      case "follow":
        return colors.green;
      case "repost":
        return colors.brand2;
      case "mention":
        return colors.yellow;
      default:
        return colors.brand;
    }
  };

  const handleItemPress = (notif: Notification) => {
    if (notif.postId) {
      router.push(`/(protected)/post/${notif.postId}`);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#090A12" : "#F8FAFC" },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "ios" ? 4 : 10),
            backgroundColor: isDark ? "rgba(9, 10, 18, 0.92)" : "rgba(248, 250, 252, 0.92)",
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>
            Notifications
          </Text>

          {unreadCount > 0 && (
            <Pressable
              onPress={markNotificationsRead}
              style={[
                styles.markReadBtn,
                { backgroundColor: colors.surface2, borderColor: colors.border },
              ]}
            >
              <CheckCheck size={14} color={colors.brand2} />
              <Text style={[styles.markReadText, { color: colors.brand2 }]}>
                Mark all read
              </Text>
            </Pressable>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilter("all")}
            style={[
              styles.filterChip,
              filter === "all" && {
                backgroundColor: isDark
                  ? "rgba(99, 102, 241, 0.2)"
                  : "rgba(99, 102, 241, 0.12)",
                borderColor: colors.brand,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: filter === "all" ? colors.brand2 : colors.text3,
                  fontWeight: filter === "all" ? "700" : "500",
                },
              ]}
            >
              All
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilter("unread")}
            style={[
              styles.filterChip,
              filter === "unread" && {
                backgroundColor: isDark
                  ? "rgba(99, 102, 241, 0.2)"
                  : "rgba(99, 102, 241, 0.12)",
                borderColor: colors.brand,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: filter === "unread" ? colors.brand2 : colors.text3,
                  fontWeight: filter === "unread" ? "700" : "500",
                },
              ]}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id || item._id || ""}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="You're all caught up!"
            description="When people like, comment, or interact with your posts, you'll see notifications here."
          />
        }
        renderItem={({ item }) => {
          const badgeColor = getNotifColor(item.type);
          return (
            <Pressable
              onPress={() => handleItemPress(item)}
              style={[
                styles.notifCard,
                {
                  backgroundColor: !item.read
                    ? isDark
                      ? "rgba(99, 102, 241, 0.08)"
                      : "rgba(99, 102, 241, 0.04)"
                    : colors.surface,
                  borderColor: !item.read
                    ? isDark
                      ? "rgba(99, 102, 241, 0.25)"
                      : "rgba(99, 102, 241, 0.15)"
                    : colors.border,
                },
              ]}
            >
              {/* Avatar with Type Badge */}
              <View style={styles.avatarContainer}>
                <Avatar
                  src={item.fromAvatar}
                  size={44}
                  name={item.from}
                />
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: badgeColor, borderColor: colors.background },
                  ]}
                >
                  {getNotifIcon(item.type)}
                </View>
              </View>

              {/* Notification Details */}
              <View style={styles.notifBody}>
                <Text style={[styles.notifText, { color: colors.text }]}>
                  <Text style={[styles.fromName, { color: colors.text }]}>
                    {item.from}{" "}
                  </Text>
                  <Text style={{ color: colors.text2 }}>{item.text}</Text>
                </Text>

                {item.postSnippet && (
                  <Text
                    style={[
                      styles.postSnippet,
                      { color: colors.text3, backgroundColor: colors.surface2 },
                    ]}
                    numberOfLines={1}
                  >
                    "{item.postSnippet}"
                  </Text>
                )}

                <Text style={[styles.timeAgo, { color: colors.text3 }]}>
                  {item.time}
                </Text>
              </View>

              {/* Unread Indicator */}
              {!item.read && (
                <View
                  style={[
                    styles.unreadDot,
                    { backgroundColor: colors.pink },
                  ]}
                />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipText: {
    fontSize: 13,
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  typeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  notifBody: {
    flex: 1,
  },
  notifText: {
    fontSize: 14,
    lineHeight: 20,
  },
  fromName: {
    fontWeight: "700",
  },
  postSnippet: {
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeAgo: {
    fontSize: 11,
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
});
