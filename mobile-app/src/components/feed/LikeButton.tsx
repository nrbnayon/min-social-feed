import { Pressable, Text } from "react-native";
import { postService } from "@/services/post.service";
export function LikeButton({ postId, count }: { postId: string; count: number }) { return <Pressable onPress={() => postService.toggleLike(postId)}><Text>{count} likes</Text></Pressable>; }
