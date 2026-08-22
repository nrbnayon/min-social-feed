import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Show stale data immediately, revalidate in background
      staleTime: 30 * 1000,       // 30s — data considered fresh
      gcTime: 5 * 60 * 1000,      // 5min — keep in cache after unmount
      retry: 2,
      refetchOnWindowFocus: false, // Mobile apps don't have window focus
    },
    mutations: {
      retry: 1,
    },
  },
});
