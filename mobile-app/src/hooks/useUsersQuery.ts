import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { useAuth } from "@/store/auth.store";
import type { SuggestedUser } from "@/types";

export const userKeys = {
  all: ["users"] as const,
  suggestions: () => ["users", "suggestions"] as const,
  following: () => ["users", "following"] as const,
  profile: (idOrUsername: string) => ["users", "profile", idOrUsername] as const,
};

/**
 * Query hook to fetch suggested creators to follow.
 */
export function useSuggestionsQuery(limit = 20) {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: userKeys.suggestions(),
    queryFn: () => userService.getSuggestions(limit),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Query hook to fetch users currently followed by the logged-in user.
 */
export function useFollowingQuery() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: userKeys.following(),
    queryFn: () => userService.getFollowing(),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Mutation hook to follow/unfollow a user with optimistic cache updates.
 */
export function useToggleFollowMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string; name?: string }) =>
      userService.toggleFollow(userId),

    onMutate: async ({ userId }) => {
      await qc.cancelQueries({ queryKey: userKeys.all });

      // 1. Optimistically update suggestions cache
      const prevSuggestions = qc.getQueryData<SuggestedUser[]>(userKeys.suggestions());
      if (prevSuggestions) {
        qc.setQueryData<SuggestedUser[]>(
          userKeys.suggestions(),
          prevSuggestions.map((u) =>
            u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
          )
        );
      }

      // 2. Optimistically update following list cache
      const prevFollowing = qc.getQueryData<SuggestedUser[]>(userKeys.following());

      return { prevSuggestions, prevFollowing };
    },

    onSuccess: () => {
      // Re-sync suggestions and following caches
      qc.invalidateQueries({ queryKey: userKeys.suggestions() });
      qc.invalidateQueries({ queryKey: userKeys.following() });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (_err, _vars, context) => {
      if (context?.prevSuggestions) {
        qc.setQueryData(userKeys.suggestions(), context.prevSuggestions);
      }
      if (context?.prevFollowing) {
        qc.setQueryData(userKeys.following(), context.prevFollowing);
      }
    },
  });
}
