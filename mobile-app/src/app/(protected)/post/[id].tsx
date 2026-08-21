import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
export default function PostScreen() { const { id } = useLocalSearchParams<{ id: string }>(); return <View className="flex-1 bg-white px-5 pt-16"><Text className="text-2xl font-bold">Post</Text><Text className="mt-4 text-slate-500">Post {id}</Text></View>; }
