/**
 * usePostsQuery.ts
 *
 * TanStack Query hooks for posts feed.
 * - Zustand  → auth state (token, user)
 * - TanStack → server data (posts list, mutations)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { useToastStore } from "@/store/useToastStore";
import type { Post } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const postKeys = {
  all: ["posts"] as const,
  list: (username?: string) => ["posts", "list", username ?? "all"] as const,
};

// ─── Normalize backend post → app Post shape ──────────────────────────────────

export function normalizePost(raw: any): Post {
  const author = raw.author ?? {};
  return {
    id: raw._id?.toString() ?? raw.id ?? "",
    _id: raw._id?.toString() ?? raw.id,
    userId: author._id?.toString() ?? author.id ?? "",
    username: author.username ?? "",
    name: author.name ?? author.username ?? "",
    avatar: author.avatar ?? author.avatarUrl ?? "",
    verified: Boolean(author.verified),
    content: raw.content ?? "",
    image: raw.images?.[0] ?? undefined,
    time: raw.createdAt ?? "",
    timeAgo: raw.createdAt ? formatTimeAgo(raw.createdAt) : "just now",
    likes: [],
    likeCount: raw.likeCount ?? 0,
    comments: [],
    commentCount: raw.commentCount ?? 0,
    shares: 0,
    bookmarks: [],
    views: 0,
    tags: [],
    author: {
      id: author._id?.toString() ?? author.id,
      username: author.username ?? "",
      avatarUrl: author.avatarUrl ?? author.avatar ?? "",
    },
    createdAt: raw.createdAt,
  };
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── GET /api/posts ───────────────────────────────────────────────────────────

/**
 * Fetch paginated posts feed from the real backend.
 * Optionally filtered by username.
 */
export function usePostsQuery(username?: string) {
  return useQuery({
    queryKey: postKeys.list(username),
    queryFn: async () => {
      const result = await postService.list(1, username);
      return {
        ...result,
        items: result.items.map(normalizePost),
      };
    },
  });
}

// ─── POST /api/posts ──────────────────────────────────────────────────────────

/**
 * Create a text-only post.
 * On success, inserts the new post at the top of all post caches.
 */
export function useCreatePostMutation() {
  const qc = useQueryClient();
  const showToast = useToastStore.getState().showToast;

  return useMutation({
    mutationFn: (content: string) => postService.create(content),
    onSuccess: (rawPost) => {
      const post = normalizePost(rawPost);
      // Optimistic-insert into all cached post lists
      qc.setQueriesData<{ items: Post[] }>({ queryKey: postKeys.all }, (old) => {
        if (!old) return old;
        return { ...old, items: [post, ...old.items] };
      });
      showToast("Post published! 🚀", "🚀");
    },
    onError: () => {
      showToast("Failed to publish post", "❌");
    },
  });
}

// ─── POST /api/posts/:id/like ─────────────────────────────────────────────────

/**
 * Toggle like on a post.
 * Optimistically updates the cache, reverts on error.
 */
export function useLikeMutation(currentUserId: string) {
  const qc = useQueryClient();
  const showToast = useToastStore.getState().showToast;

  return useMutation({
    mutationFn: (postId: string) => postService.toggleLike(postId),

    onMutate: async (postId: string) => {
      await qc.cancelQueries({ queryKey: postKeys.all });
      // Snapshot all post list caches for potential rollback
      const snapshots = qc.getQueriesData<{ items: Post[] }>({ queryKey: postKeys.all });

      // Optimistic toggle
      qc.setQueriesData<{ items: Post[] }>({ queryKey: postKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p) => {
            if ((p.id || p._id) !== postId) return p;
            const alreadyLiked = (p.likes || []).includes(currentUserId);
            const likes = alreadyLiked
              ? (p.likes || []).filter((id) => id !== currentUserId)
              : [...(p.likes || []), currentUserId];
            return {
              ...p,
              likes,
              likeCount: alreadyLiked
                ? Math.max(0, (p.likeCount ?? likes.length + 1) - 1)
                : (p.likeCount ?? likes.length - 1) + 1,
            };
          }),
        };
      });

      return { snapshots };
    },

    onSuccess: (result, postId) => {
      showToast(result.liked ? "Post liked" : "Post unliked", result.liked ? "❤️" : "🤍");
      // Reconcile server likeCount
      qc.setQueriesData<{ items: Post[] }>({ queryKey: postKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p) =>
            (p.id || p._id) === postId ? { ...p, likeCount: result.likeCount } : p
          ),
        };
      });
    },

    onError: (_err, _postId, context) => {
      // Revert optimistic update
      context?.snapshots?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data);
      });
      showToast("Failed to like post", "❌");
    },
  });
}

// ─── POST /api/posts/:id/comments ────────────────────────────────────────────

/**
 * Add a comment to a post.
 * Optimistically inserts a temporary comment, replaces with server response.
 */
export function useCommentMutation(currentUser: any) {
  const qc = useQueryClient();
  const showToast = useToastStore.getState().showToast;

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      postService.comment(postId, content),

    onMutate: async ({ postId, content }) => {
      await qc.cancelQueries({ queryKey: postKeys.all });
      const snapshots = qc.getQueriesData<{ items: Post[] }>({ queryKey: postKeys.all });

      const tempId = `c_temp_${Date.now()}`;
      const optimisticComment = {
        id: tempId,
        userId: currentUser?.id ?? "",
        username: currentUser?.username ?? "",
        name: currentUser?.name ?? "",
        avatar: currentUser?.avatar ?? "",
        text: content,
        content,
        time: "just now",
        likes: 0,
      };

      qc.setQueriesData<{ items: Post[] }>({ queryKey: postKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p) => {
            if ((p.id || p._id) !== postId) return p;
            return {
              ...p,
              comments: [...(p.comments || []), optimisticComment],
              commentCount: (p.commentCount ?? (p.comments || []).length) + 1,
            };
          }),
        };
      });

      return { snapshots, tempId };
    },

    onSuccess: (serverComment, { postId }, context) => {
      // Replace optimistic comment with real server data
      qc.setQueriesData<{ items: Post[] }>({ queryKey: postKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p) => {
            if ((p.id || p._id) !== postId) return p;
            const author = serverComment?.author ?? {};
            const realComment = {
              id: serverComment?._id?.toString() ?? context?.tempId ?? `c_${Date.now()}`,
              userId: author._id?.toString() ?? author.id ?? currentUser?.id ?? "",
              username: author.username ?? currentUser?.username ?? "",
              name: author.name ?? currentUser?.name ?? "",
              avatar: author.avatar ?? author.avatarUrl ?? currentUser?.avatar ?? "",
              text: serverComment?.content ?? serverComment?.text ?? "",
              content: serverComment?.content ?? "",
              time: "just now",
              likes: 0,
            };
            return {
              ...p,
              comments: (p.comments || []).map((c) =>
                c.id === context?.tempId ? realComment : c
              ),
            };
          }),
        };
      });
      showToast("Comment posted", "💬");
    },

    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data);
      });
      showToast("Failed to post comment", "❌");
    },
  });
}
