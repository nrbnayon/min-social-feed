import { Image, View } from "react-native";
export function Avatar({ uri }: { uri?: string }) { return uri ? <Image source={{ uri }} className="h-10 w-10 rounded-full" /> : <View className="h-10 w-10 rounded-full bg-slate-300" />; }
