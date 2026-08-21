import { Text, View } from "react-native";
import type { Comment } from "@/types/comment";
export function CommentItem({ comment }: { comment: Comment }) { return <View className="py-2"><Text className="font-bold">{comment.author.username}</Text><Text>{comment.content}</Text></View>; }
