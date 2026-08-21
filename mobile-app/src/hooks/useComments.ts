import { postService } from "@/services/post.service";
export const useComments = (postId: string) => ({ addComment: (content: string) => postService.comment(postId, content) });
