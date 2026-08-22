/**
 * useNotificationsQuery.ts
 *
 * TanStack Query hooks for notifications.
 * - Fetches from GET /api/auth/notifications
 * - PATCH /api/auth/notifications/read-all
 * - PATCH /api/auth/notifications/:id/read
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/post.service";
import type { Notification } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => ["notifications", "list"] as const,
};

// ─── Normalize ────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function normalizeNotification(raw: any): Notification {
  // Backend populates the sender field (not actor)
  const sender = raw.sender ?? raw.actor ?? {};

  // post can be a populated object { _id, content, ... } or a plain ObjectId string
  const postObj = raw.post && typeof raw.post === "object" ? raw.post : null;
  const postId: string | undefined =
    postObj?._id?.toString() ??
    postObj?.id?.toString() ??
    (typeof raw.post === "string" ? raw.post : undefined) ??
    raw.postId;

  // Grab a short snippet from the post content if available
  const postContent: string | undefined = postObj?.content;
  const postSnippet: string | undefined =
    raw.postSnippet ??
    (postContent ? postContent.slice(0, 80) + (postContent.length > 80 ? "…" : "") : undefined);

  return {
    id: raw._id?.toString() ?? raw.id ?? `n_${Date.now()}`,
    _id: raw._id?.toString(),
    type: raw.type ?? "like",
    from: sender.name ?? sender.username ?? raw.from ?? "Someone",
    fromId: sender._id?.toString() ?? sender.id ?? raw.fromId ?? "",
    fromAvatar: sender.avatar ?? sender.avatarUrl ?? raw.fromAvatar ?? "",
    postId,
    postSnippet,
    text:
      raw.type === "like"
        ? "liked your post"
        : raw.type === "comment"
        ? "commented on your post"
        : raw.text ?? "",
    time: raw.createdAt ? formatTimeAgo(raw.createdAt) : "just now",
    read: Boolean(raw.read),
    createdAt: raw.createdAt,
  };
}

// ─── GET /api/auth/notifications ─────────────────────────────────────────────

export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const result = await notificationService.list();
      return {
        notifications: result.notifications.map(normalizeNotification),
        total: result.total,
        unreadCount: result.unreadCount,
      };
    },
    staleTime: 15 * 1000, // Refresh more often than posts
  });
}

// ─── PATCH /api/auth/notifications/read-all ───────────────────────────────────

export function useMarkAllReadMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.list() });
      const prev = qc.getQueryData(notificationKeys.list());

      // Optimistic update — mark all read locally
      qc.setQueryData<{ notifications: Notification[]; unreadCount: number }>(
        notificationKeys.list(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          };
        }
      );

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        qc.setQueryData(notificationKeys.list(), context.prev);
      }
    },
  });
}

// ─── PATCH /api/auth/notifications/:id/read ───────────────────────────────────

export function useMarkReadMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: notificationKeys.list() });
      const prev = qc.getQueryData(notificationKeys.list());

      qc.setQueryData<{ notifications: Notification[]; unreadCount: number }>(
        notificationKeys.list(),
        (old) => {
          if (!old) return old;
          const wasUnread = old.notifications.find(
            (n) => (n.id === id || n._id === id) && !n.read
          );
          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n.id === id || n._id === id ? { ...n, read: true } : n
            ),
            unreadCount: wasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
          };
        }
      );

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        qc.setQueryData(notificationKeys.list(), context.prev);
      }
    },
  });
}
