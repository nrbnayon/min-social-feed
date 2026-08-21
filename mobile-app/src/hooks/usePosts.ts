import { create } from "zustand";
import type { Post, Story, Notification, Comment } from "@/types";
import { SEED_POSTS, SEED_STORIES, SEED_NOTIFICATIONS, CURRENT_USER } from "@/data/seed";
import { postService } from "@/services/post.service";
import { useToastStore } from "@/store/useToastStore";

interface PostsState {
  posts: Post[];
  stories: Story[];
  notifications: Notification[];
  isLoading: boolean;
  activeFilter: "all" | "following";

  setActiveFilter: (filter: "all" | "following") => void;
  fetchPosts: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleLike: (postId: string, userId?: string, userName?: string, userAvatar?: string) => void;
  toggleBookmark: (postId: string, userId?: string) => void;
  createPost: (content: string, tags?: string[], image?: string, currentUser?: any) => Promise<Post>;
  addComment: (postId: string, text: string, currentUser?: any) => void;
  markStorySeen: (storyId: string) => void;
  markNotificationsRead: () => void;
  sharePost: (postId: string) => void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: SEED_POSTS,
  stories: SEED_STORIES,
  notifications: SEED_NOTIFICATIONS,
  isLoading: false,
  activeFilter: "all",

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const response = await postService.list(1);
      if (response && response.items && response.items.length > 0) {
        set({ posts: response.items, isLoading: false });
        return;
      }
    } catch {
      // Fallback to seed posts
    }
    set({ isLoading: false });
  },

  refresh: async () => {
    await get().fetchPosts();
  },

  toggleLike: (postId: string, userId = CURRENT_USER.id, userName = CURRENT_USER.name, userAvatar = CURRENT_USER.avatar) => {
    const { posts, notifications } = get();
    const showToast = useToastStore.getState().showToast;

    try {
      postService.toggleLike(postId).catch(() => {});
    } catch {}

    const updated = posts.map((p) => {
      const pId = p.id || p._id;
      if (pId !== postId) return p;

      const currentLikes = p.likes || [];
      const alreadyLiked = currentLikes.includes(userId);
      const nextLikes = alreadyLiked
        ? currentLikes.filter((id) => id !== userId)
        : [...currentLikes, userId];

      if (!alreadyLiked) {
        showToast("Post liked", "❤️");
        // Add notification if not own post
        if (p.userId !== userId) {
          const newNotif: Notification = {
            id: `n_${Date.now()}`,
            type: "like",
            from: userName,
            fromId: userId,
            fromAvatar: userAvatar,
            postId: pId,
            postSnippet: p.content.slice(0, 45) + "…",
            text: "liked your post",
            time: "just now",
            read: false,
          };
          set({ notifications: [newNotif, ...notifications] });
        }
      }

      return {
        ...p,
        likes: nextLikes,
        likeCount: nextLikes.length,
      };
    });

    set({ posts: updated });
  },

  toggleBookmark: (postId: string, userId = CURRENT_USER.id) => {
    const { posts } = get();
    const showToast = useToastStore.getState().showToast;

    const updated = posts.map((p) => {
      const pId = p.id || p._id;
      if (pId !== postId) return p;

      const currentBookmarks = p.bookmarks || [];
      const already = currentBookmarks.includes(userId);
      const next = already
        ? currentBookmarks.filter((id) => id !== userId)
        : [...currentBookmarks, userId];

      showToast(already ? "Removed from bookmarks" : "Saved to bookmarks", already ? "🗑️" : "🔖");
      return { ...p, bookmarks: next };
    });

    set({ posts: updated });
  },

  createPost: async (content: string, tags: string[] = [], image?: string, currentUser = CURRENT_USER) => {
    const showToast = useToastStore.getState().showToast;

    const newPost: Post = {
      id: `p_${Date.now()}`,
      userId: currentUser.id || "u0",
      username: currentUser.username || "user",
      name: currentUser.name || "User",
      avatar: currentUser.avatar || CURRENT_USER.avatar,
      verified: currentUser.verified || false,
      content,
      image,
      time: new Date().toISOString(),
      timeAgo: "just now",
      likes: [],
      comments: [],
      shares: 0,
      bookmarks: [],
      views: 1,
      tags: tags.length > 0 ? tags : ["Feed"],
    };

    try {
      await postService.create(content);
    } catch {}

    set((state) => ({ posts: [newPost, ...state.posts] }));
    showToast("Post published! 🚀", "🚀");
    return newPost;
  },

  addComment: (postId: string, text: string, currentUser = CURRENT_USER) => {
    const { posts, notifications } = get();
    const showToast = useToastStore.getState().showToast;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id || "u0",
      username: currentUser.username || "user",
      name: currentUser.name || "User",
      avatar: currentUser.avatar || CURRENT_USER.avatar,
      text,
      time: "just now",
      likes: 0,
    };

    try {
      postService.comment(postId, text).catch(() => {});
    } catch {}

    const updated = posts.map((p) => {
      const pId = p.id || p._id;
      if (pId !== postId) return p;

      if (p.userId !== currentUser.id) {
        const notif: Notification = {
          id: `n_${Date.now()}`,
          type: "comment",
          from: currentUser.name,
          fromId: currentUser.id,
          fromAvatar: currentUser.avatar,
          postId: pId,
          postSnippet: p.content.slice(0, 45) + "…",
          text: `commented: "${text.slice(0, 30)}${text.length > 30 ? "..." : ""}"`,
          time: "just now",
          read: false,
        };
        set({ notifications: [notif, ...notifications] });
      }

      const existingComments = p.comments || [];
      return {
        ...p,
        comments: [...existingComments, newComment],
        commentCount: existingComments.length + 1,
      };
    });

    set({ posts: updated });
    showToast("Comment posted", "💬");
  },

  markStorySeen: (storyId: string) => {
    set((state) => ({
      stories: state.stories.map((s) => (s.id === storyId ? { ...s, seen: true } : s)),
    }));
  },

  markNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    useToastStore.getState().showToast("All notifications marked as read", "✓");
  },

  sharePost: (postId: string) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        (p.id || p._id) === postId ? { ...p, shares: (p.shares || 0) + 1 } : p
      ),
    }));
  },
}));

export const usePosts = () => usePostsStore();
