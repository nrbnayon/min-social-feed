import { api } from "./api";
import type { PaginatedPosts } from "@/types/post";

export const postService = {
  list: (page = 1, username?: string) => api.get<{ data: PaginatedPosts }>("/posts", { params: { page, username } }).then((response) => response.data.data),
  create: (content: string) => api.post("/posts", { content }),
  toggleLike: (id: string) => api.post(`/posts/${id}/like`),
  comment: (id: string, content: string) => api.post(`/posts/${id}/comments`, { content }),
};
