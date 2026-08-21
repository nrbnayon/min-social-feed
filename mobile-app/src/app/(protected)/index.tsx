import { Link } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { usePosts } from "@/hooks/usePosts";

export default function FeedScreen() {
  const { posts, isLoading, refresh } = usePosts();
  return <View className="flex-1 bg-white px-5 pt-16"><Text className="text-3xl font-bold text-slate-900">Your feed</Text><Link href="/(app)/create-post" asChild><Pressable className="my-5 rounded-xl bg-teal-700 p-4"><Text className="text-center font-bold text-white">Create post</Text></Pressable></Link><FlatList data={posts} refreshing={isLoading} onRefresh={refresh} keyExtractor={(post) => post._id} ListEmptyComponent={<Text className="py-10 text-center text-slate-500">{isLoading ? "Loading posts..." : "No posts yet."}</Text>} renderItem={({ item }) => <View className="mb-4 border-b border-slate-200 pb-4"><Text className="font-bold text-slate-900">{item.author.username}</Text><Text className="mt-2 text-base text-slate-700">{item.content}</Text><Text className="mt-2 text-xs text-slate-400">{item.likeCount} likes · {item.commentCount} comments</Text></View>} /></View>;
}
