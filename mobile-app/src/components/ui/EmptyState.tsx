import { Text } from "react-native";
export function EmptyState({ message = "Nothing here yet." }: { message?: string }) { return <Text className="py-8 text-center text-slate-500">{message}</Text>; }
