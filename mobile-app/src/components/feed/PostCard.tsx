import { Text, View } from "react-native";
import type { Post } from "@/types/post";
export function PostCard({ post }: { post: Post }) { return <View className="border-b border-slate-200 py-4"><Text className="font-bold">{post.author.username}</Text><Text className="mt-2">{post.content}</Text></View>; }
