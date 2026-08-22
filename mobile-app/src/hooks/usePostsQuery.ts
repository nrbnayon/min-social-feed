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
import type { Post, Comment } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const postKeys = {
  all: ["posts"] as const,
  list: (username?: string) => ["posts", "list", username ?? "all"] as const,
};

// ─── Normalize backend comment → app Comment shape ────────────────────────────

export function normalizeComment(raw: any): Comment {
  const author = raw.author ?? {};
  const replyTo = raw.replyTo ?? null;
  return {
    id: raw._id?.toString() ?? raw.id ?? "",
    _id: raw._id?.toString() ?? raw.id,
    userId: author._id?.toString() ?? author.id ?? raw.user?.toString() ?? "",
    username: author.username ?? raw.username ?? "user",
    name: author.name ?? author.username ?? raw.name ?? "User",
    avatar: author.avatar ?? author.avatarUrl ?? raw.avatar ?? "",
    text: raw.content ?? raw.text ?? "",
    content: raw.content ?? raw.text ?? "",
    time: raw.createdAt ? formatTimeAgo(raw.createdAt) : "just now",
    createdAt: raw.createdAt,
    likes: Array.isArray(raw.likes) ? raw.likes.length : (typeof raw.likes === "number" ? raw.likes : 0),
    parentId: raw.parentId?.toString() ?? raw.parentId ?? null,
    replyTo: replyTo
      ? {
          id: replyTo._id?.toString() ?? replyTo.id,
          username: replyTo.username ?? "",
          name: replyTo.name ?? replyTo.username ?? "",
          avatarUrl: replyTo.avatar ?? replyTo.avatarUrl ?? "",
        }
      : null,
    author: {
      id: author._id?.toString() ?? author.id,
      username: author.username ?? "user",
      avatarUrl: author.avatarUrl ?? author.avatar ?? "",
    },
  };
}

/**
 * Organizes a flat list of comments into top-level comments with nested replies.
 * Robustly deduplicates any duplicate IDs.
 */
export function buildThreadedComments(comments: Comment[]): Comment[] {
  if (!comments || !comments.length) return [];

  // Deduplicate comments list by unique ID
  const seenIds = new Set<string>();
  const deduped: Comment[] = [];
  comments.forEach((c) => {
    const key = c.id || c._id || "";
    if (key) {
      if (seenIds.has(key)) return;
      seenIds.add(key);
    }
    deduped.push(c);
  });

  const topLevel: Comment[] = [];
  const repliesMap = new Map<string, Comment[]>();

  deduped.forEach((c) => {
    const parentId = c.parentId;
    if (parentId) {
      if (!repliesMap.has(parentId)) {
        repliesMap.set(parentId, []);
      }
      repliesMap.get(parentId)!.push(c);
    } else {
      topLevel.push({ ...c, replies: [] });
    }
  });

  return topLevel.map((parent) => {
    const pId = parent.id || parent._id || "";
    return {
      ...parent,
      replies: repliesMap.get(pId) || [],
    };
  });
}

// ─── Normalize backend post → app Post shape ──────────────────────────────────

export function normalizePost(raw: any): Post {
  const author = raw.author ?? {};
  const likesList: string[] = Array.isArray(raw.likes)
    ? raw.likes
        .map((l: any) =>
          typeof l === "object"
            ? l.user?.toString() || l._id?.toString() || l.id?.toString() || ""
            : l.toString()
        )
        .filter(Boolean)
    : [];

  const commentsList: Comment[] = Array.isArray(raw.comments)
    ? raw.comments.map(normalizeComment)
    : [];

  const likeCount = typeof raw.likeCount === "number" ? raw.likeCount : likesList.length;
  const commentCount = typeof raw.commentCount === "number" ? raw.commentCount : commentsList.length;

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
    likes: likesList,
    likeCount,
    comments: commentsList,
    commentCount,
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
    staleTime: 60 * 1000,
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
    mutationFn: ({
      postId,
      content,
      parentId,
      replyTo,
    }: {
      postId: string;
      content: string;
      parentId?: string;
      replyTo?: string;
    }) => postService.comment(postId, content, parentId, replyTo),

    onMutate: async ({ postId, content, parentId, replyTo }) => {
      await qc.cancelQueries({ queryKey: postKeys.all });
      const snapshots = qc.getQueriesData<{ items: Post[] }>({ queryKey: postKeys.all });

      const tempId = `c_temp_${Date.now()}`;
      const optimisticComment: Comment = {
        id: tempId,
        userId: currentUser?.id ?? "",
        username: currentUser?.username ?? "",
        name: currentUser?.name ?? "",
        avatar: currentUser?.avatar ?? "",
        text: content,
        content,
        time: "just now",
        likes: 0,
        parentId: parentId ?? null,
        replyTo: replyTo ? { id: replyTo, username: "" } : null,
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
            const replyTo = serverComment?.replyTo ?? null;
            const realComment: Comment = {
              id: serverComment?._id?.toString() ?? context?.tempId ?? `c_${Date.now()}`,
              userId: author._id?.toString() ?? author.id ?? currentUser?.id ?? "",
              username: author.username ?? currentUser?.username ?? "",
              name: author.name ?? currentUser?.name ?? "",
              avatar: author.avatar ?? author.avatarUrl ?? currentUser?.avatar ?? "",
              text: serverComment?.content ?? serverComment?.text ?? "",
              content: serverComment?.content ?? "",
              time: "just now",
              likes: 0,
              parentId: serverComment?.parentId?.toString() ?? null,
              replyTo: replyTo
                ? {
                    id: replyTo._id?.toString() ?? replyTo.id,
                    username: replyTo.username ?? "",
                    name: replyTo.name ?? replyTo.username ?? "",
                    avatarUrl: replyTo.avatar ?? replyTo.avatarUrl ?? "",
                  }
                : null,
            };
            const filtered = (p.comments || []).filter((c) => c.id !== context?.tempId);
            const exists = filtered.some(
              (c) =>
                (c.id && c.id === realComment.id) ||
                (c._id && c._id === realComment.id)
            );
            const finalComments = exists ? filtered : [...filtered, realComment];

            return {
              ...p,
              comments: finalComments,
            };
          }),
        };
      });
      // Invalidate single post cache if any
      qc.invalidateQueries({ queryKey: ["post", postId] });
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
