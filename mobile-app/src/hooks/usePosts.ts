import { useEffect, useState } from "react";
import { postService } from "@/services/post.service";
import type { Post } from "@/types/post";

export const usePosts = (username?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { postService.list(1, username).then((result) => setPosts(result.items)).finally(() => setIsLoading(false)); }, [username]);
  return { posts, isLoading, refresh: () => postService.list(1, username).then((result) => setPosts(result.items)) };
};
