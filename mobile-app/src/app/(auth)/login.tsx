import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useAuth } from "@/store/auth.store";

export default function LoginScreen() {
	const login = useAuth((state) => state.login);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const submit = async () => { try { await login(email.trim(), password); router.replace("/(app)"); } catch (error) { Alert.alert("Unable to log in", error instanceof Error ? error.message : "Please try again"); } };
	return <View className="flex-1 justify-center bg-white px-6"><Text className="text-4xl font-bold text-slate-900">Welcome back</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" className="mt-8 rounded-xl border border-slate-300 p-4" /><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" className="mt-3 rounded-xl border border-slate-300 p-4" /><Pressable onPress={submit} className="mt-5 rounded-xl bg-teal-700 p-4"><Text className="text-center font-bold text-white">Log in</Text></Pressable><Link href="/(auth)/sign-up" className="mt-5 text-center text-teal-700">Create an account</Link></View>;
}
