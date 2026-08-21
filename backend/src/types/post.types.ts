export type CreatePostInput = { content: string };
export type Paginated<T> = { items: T[]; page: number; limit: number; total: number; hasMore: boolean };
