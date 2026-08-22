import { api } from "./api";
import type { SuggestedUser, User } from "@/types";

export const userService = {
  /**
   * Get suggestions for users to follow.
   * GET /api/users/suggestions
   */
  getSuggestions: async (limit = 20): Promise<SuggestedUser[]> => {
    const res = await api.get<{ data: { users: SuggestedUser[] } }>("/users/suggestions", {
      params: { limit },
    });
    return res.data.data.users || [];
  },

  /**
   * Get list of users followed by current user.
   * GET /api/users/following
   */
  getFollowing: async (): Promise<SuggestedUser[]> => {
    const res = await api.get<{ data: { users: SuggestedUser[] } }>("/users/following");
    return res.data.data.users || [];
  },

  /**
   * Toggle follow / unfollow on a user.
   * POST /api/users/:id/follow
   */
  toggleFollow: async (
    userId: string
  ): Promise<{ following: boolean; followersCount: number; followingCount: number }> => {
    const res = await api.post<{
      data: { following: boolean; followersCount: number; followingCount: number };
    }>(`/users/${userId}/follow`);
    return res.data.data;
  },

  /**
   * Get single user public profile.
   * GET /api/users/:id
   */
  getProfile: async (idOrUsername: string): Promise<User & { isFollowing: boolean }> => {
    const res = await api.get<{ data: { user: any } }>(`/users/${idOrUsername}`);
    return res.data.data.user;
  },
};
