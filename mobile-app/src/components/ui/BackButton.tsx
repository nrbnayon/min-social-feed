import { Pressable, Text } from "react-native";
export function BackButton({ onPress }: { onPress: () => void }) { return <Pressable onPress={onPress}><Text>Back</Text></Pressable>; }
