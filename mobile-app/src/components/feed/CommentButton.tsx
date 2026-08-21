import { Pressable, Text } from "react-native";
export function CommentButton({ count }: { count: number }) { return <Pressable><Text>{count} comments</Text></Pressable>; }
