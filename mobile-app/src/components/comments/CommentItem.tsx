import React from "react";
import { Text, View, StyleSheet } from "react-native";
import type { Comment } from "@/types";
import { Avatar } from "@/components/Shared/Avatar";
import { useAppTheme } from "@/context/ThemeContext";

export function CommentItem({ comment }: { comment: Comment }) {
  const { colors } = useAppTheme();
  const authorName = comment.name || comment.author?.username || comment.username || "User";
  const authorUsername = comment.username || comment.author?.username || "user";
  const authorAvatar = comment.avatar || comment.author?.avatarUrl;

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <Avatar src={authorAvatar} size={36} name={authorName} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: colors.text }]}>{authorName}</Text>
          <Text style={[styles.username, { color: colors.text3 }]}>@{authorUsername}</Text>
        </View>
        <Text style={[styles.text, { color: colors.text }]}>{comment.text || comment.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  username: {
    fontSize: 12,
  },
  text: {
    fontSize: 13.5,
    lineHeight: 18,
  },
});

export default CommentItem;
