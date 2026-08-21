import { FlatList } from "react-native";
import type { Post } from "@/types/post";
import { PostCard } from "./PostCard";
export function PostList({ posts }: { posts: Post[] }) { return <FlatList data={posts} keyExtractor={(post) => post._id} renderItem={({ item }) => <PostCard post={item} />} />; }
