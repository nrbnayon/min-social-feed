import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { postService } from "@/services/post.service";

export default function CreatePostScreen() { const [content, setContent] = useState(""); const submit = async () => { if (!content.trim()) return; await postService.create(content.trim()); router.back(); }; return <View className="flex-1 bg-white px-5 pt-16"><Text className="text-2xl font-bold">Create post</Text><TextInput value={content} onChangeText={setContent} multiline placeholder="Share something..." className="my-6 min-h-32 rounded-xl border border-slate-300 p-4" /><Pressable onPress={submit} className="rounded-xl bg-teal-700 p-4"><Text className="text-center font-bold text-white">Publish</Text></Pressable></View>; }
