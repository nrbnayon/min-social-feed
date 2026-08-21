export type PostAuthor = { username: string; avatarUrl?: string };
export type Post = { _id: string; content: string; author: PostAuthor; likeCount: number; commentCount: number; createdAt: string };
export type PaginatedPosts = { items: Post[]; page: number; limit: number; total: number; hasMore: boolean };
