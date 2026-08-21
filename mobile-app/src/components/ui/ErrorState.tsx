import { Text } from "react-native";
export function ErrorState({ message = "Something went wrong." }: { message?: string }) { return <Text className="py-8 text-center text-red-600">{message}</Text>; }
