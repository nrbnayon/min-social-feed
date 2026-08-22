import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, joinUserRoom } from "@/services/socket";
import { postKeys, normalizeComment } from "@/hooks/usePostsQuery";
import { notificationKeys, normalizeNotification } from "@/hooks/useNotificationsQuery";
import { useAuth } from "@/store/auth.store";
import type { Post, Notification, Comment } from "@/types";

export function useRealtimeEvents() {
  const qc = useQueryClient();
  const currentUser = useAuth((s) => s.user);
  const userId = currentUser?.id || "";

  useEffect(() => {
    const socket = getSocket();

    if (userId) {
      joinUserRoom(userId);
    }

    // ── 1. Live Post Like Event ──────────────────────────────────────────────
    const handlePostLiked = (data: {
      postId: string;
      liked: boolean;
      likeCount: number;
      userId: string;
    }) => {
      const { postId, liked, likeCount, userId: likerId } = data;

      // Update feed list
      qc.setQueriesData<{ items: Post[] }>({ queryKey: postKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p) => {
            if ((p.id || p._id) !== postId) return p;
            const currentLikes = p.likes || [];
            const nextLikes = liked
              ? Array.from(new Set([...currentLikes, likerId]))
              : currentLikes.filter((id) => id !== likerId);
            return {
              ...p,
              likes: nextLikes,
              likeCount,
            };
          }),
        };
      });

      // Update active single post detail
      qc.setQueryData<Post>(["post", postId], (old) => {
        if (!old) return old;
        const currentLikes = old.likes || [];
        const nextLikes = liked
          ? Array.from(new Set([...currentLikes, likerId]))
          : currentLikes.filter((id) => id !== likerId);
        return {
          ...old,
          likes: nextLikes,
          likeCount,
        };
      });
    };

    // ── 2. Live Post Comment / Reply Event ───────────────────────────────────
    const handlePostCommented = (data: {
      postId: string;
      comment: any;
      commentCount: number;
    }) => {
      const { postId, comment, commentCount } = data;
      const normComment = normalizeComment(comment);
      const realId = normComment.id || normComment._id;

      const reconcileComments = (existingComments: Comment[]): Comment[] => {
        const alreadyExists = existingComments.some((c) => {
          const cId = c.id || c._id;
          return cId && (cId === realId || cId === normComment.id || cId === normComment._id);
        });
        if (alreadyExists) return existingComments;

        // Check if there is an optimistic comment from the same user to replace
        const optIndex = existingComments.findIndex((c) => {
          const cId = c.id || c._id || "";
          return (
            cId.startsWith("c_opt_") &&
            (c.userId === normComment.userId || c.username === normComment.username) &&
            (c.text === normComment.text || c.content === normComment.content)
          );
        });

        if (optIndex >= 0) {
          const clone = [...existingComments];
          clone[optIndex] = normComment;
          return clone;
        }

        return [...existingComments, normComment];
      };

      // Update feed list
      qc.setQueriesData<{ items: Post[] }>({ queryKey: postKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p) => {
            if ((p.id || p._id) !== postId) return p;
            const comments = p.comments || [];
            const nextComments = reconcileComments(comments);
            return {
              ...p,
              comments: nextComments,
              commentCount: Math.max(commentCount ?? 0, nextComments.length),
            };
          }),
        };
      });

      // Update active single post detail
      qc.setQueryData<Post>(["post", postId], (old) => {
        if (!old) return old;
        const comments = old.comments || [];
        const nextComments = reconcileComments(comments);
        return {
          ...old,
          comments: nextComments,
          commentCount: Math.max(commentCount ?? 0, nextComments.length),
        };
      });
    };

    // ── 3. Live Notification Event ───────────────────────────────────────────
    const handleNewNotification = (rawNotif: any) => {
      const normNotif = normalizeNotification(rawNotif);

      qc.setQueryData<{ notifications: Notification[]; unreadCount: number; total: number }>(
        notificationKeys.list(),
        (old) => {
          if (!old) {
            return {
              notifications: [normNotif],
              unreadCount: 1,
              total: 1,
            };
          }
          const exists = old.notifications.some(
            (n) =>
              (n.id && n.id === normNotif.id) ||
              (n._id && n._id === normNotif._id)
          );
          if (exists) return old;
          return {
            ...old,
            notifications: [normNotif, ...old.notifications],
            unreadCount: old.unreadCount + 1,
            total: (old.total || 0) + 1,
          };
        }
      );
    };

    socket.on("post:liked", handlePostLiked);
    socket.on("post:commented", handlePostCommented);
    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("post:liked", handlePostLiked);
      socket.off("post:commented", handlePostCommented);
      socket.off("notification:new", handleNewNotification);
    };
  }, [userId, qc]);
}
