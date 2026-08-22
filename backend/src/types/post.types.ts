// ─── Post DTOs ────────────────────────────────────────────────────────────────

export interface CreatePostDTO {
  content: string;
  images?: string[];
}

export interface CreateCommentDTO {
  content: string;
  parentId?: string;
  replyTo?: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
