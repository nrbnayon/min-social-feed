import { api } from "./api";
import type { Post, Notification } from "@/types";

// ─── Response shapes ──────────────────────────────────────────────────────────

export type PaginatedPostsResult = {
  items: Post[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type NotificationsResult = {
  notifications: Notification[];
  total: number;
  unreadCount: number;
};

// ─── Posts API ────────────────────────────────────────────────────────────────

export const postService = {
  /**
   * Retrieve all posts (paginated, newest first).
   * GET /api/posts?page=&limit=&username=
   */
  list: async (page = 1, username?: string): Promise<PaginatedPostsResult> => {
    const res = await api.get<{ data: { items: Post[]; pagination: { page: number; limit: number; total: number; hasMore: boolean } } }>("/posts", {
      params: { page, limit: 20, ...(username ? { username } : {}) },
    });
    const { items, pagination } = res.data.data;
    return {
      items,
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      hasMore: pagination.hasMore,
    };
  },

  /**
   * Create a text-only post.
   * POST /api/posts
   */
  create: async (content: string): Promise<Post> => {
    const res = await api.post<{ data: { post: Post } }>("/posts", { content });
    return res.data.data.post;
  },

  /**
   * Like or unlike a post.
   * POST /api/posts/:id/like
   */
  toggleLike: (id: string): Promise<{ liked: boolean; likeCount: number }> =>
    api
      .post<{ data: { liked: boolean; likeCount: number } }>(`/posts/${id}/like`)
      .then((res) => res.data.data),

  /**
   * Add a comment to a post.
   * POST /api/posts/:id/comments
   */
  comment: (id: string, content: string) =>
    api
      .post<{ data: { comment: any } }>(`/posts/${id}/comments`, { content })
      .then((res) => res.data.data.comment),
};

// ─── Notifications API ────────────────────────────────────────────────────────

export const notificationService = {
  /**
   * Fetch notifications for the current user.
   * GET /api/auth/notifications
   */
  list: async (page = 1): Promise<NotificationsResult> => {
    const res = await api.get<{ data: any }>("/auth/notifications", {
      params: { page, limit: 50 },
    });
    const d = res.data.data;
    return {
      notifications: d.notifications ?? d.items ?? [],
      total: d.total ?? 0,
      unreadCount: d.unreadCount ?? 0,
    };
  },

  /**
   * Mark a single notification as read.
   * PATCH /api/auth/notifications/:id/read
   */
  markRead: (id: string) =>
    api.patch(`/auth/notifications/${id}/read`),

  /**
   * Mark all notifications as read.
   * PATCH /api/auth/notifications/read-all
   */
  markAllRead: () =>
    api.patch("/auth/notifications/read-all"),
};
