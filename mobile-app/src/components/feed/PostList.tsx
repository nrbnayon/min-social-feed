import React from "react";
import { FlatList, FlatListProps } from "react-native";
import type { Post } from "@/types";
import { PostCard } from "./PostCard";

interface PostListProps extends Partial<FlatListProps<Post>> {
  posts: Post[];
  onCommentPress?: (post: Post) => void;
  onSharePress?: (post: Post) => void;
}

export function PostList({ posts, onCommentPress, onSharePress, ...props }: PostListProps) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(post) => post.id || post._id || String(Math.random())}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onCommentPress={onCommentPress}
          onSharePress={onSharePress}
        />
      )}
      {...props}
    />
  );
}

export default PostList;
