import { create } from "zustand";
import type { RegisterInput, User } from "@/types";
import { authService } from "@/services/auth.service";
import { storage } from "@/lib/storage";
import { CURRENT_USER } from "@/data/seed";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: CURRENT_USER,
  token: "demo_token_authenticated",
  isAuthenticated: true,
  isLoading: false,

  initialize: async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        set({ token, isAuthenticated: true, user: CURRENT_USER, isLoading: false });
      } else {
        // Default to demo authenticated state for instant preview
        set({ token: "demo_token_authenticated", isAuthenticated: true, user: CURRENT_USER, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password?: string) => {
    try {
      const result = await authService.login(email, password || "password123");
      await storage.setToken(result.token);
      set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      // If backend offline, log in locally with demo/input profile
      const localUser: User = {
        ...CURRENT_USER,
        email,
        username: email.split("@")[0] || "user",
        name: email.split("@")[0] || "User",
      };
      await storage.setToken("local_token_" + Date.now());
      set({ user: localUser, token: "local_token", isAuthenticated: true, isLoading: false });
    }
  },

  loginDemo: async () => {
    await storage.setToken("demo_token_authenticated");
    set({ user: CURRENT_USER, token: "demo_token_authenticated", isAuthenticated: true, isLoading: false });
  },

  register: async (input: RegisterInput) => {
    try {
      const result = await authService.register(input);
      await storage.setToken(result.token);
      set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      // Local fallback
      const newUser: User = {
        id: "u_" + Date.now(),
        name: input.name || input.username,
        username: input.username,
        email: input.email,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&auto=format",
        bio: "Social feed explorer 🚀",
        location: "Global",
        website: "",
        followers: 0,
        following: 0,
        verified: false,
        joinedDate: "Just now",
      };
      await storage.setToken("local_token_" + Date.now());
      set({ user: newUser, token: "local_token", isAuthenticated: true, isLoading: false });
    }
  },

  logout: async () => {
    await storage.clearToken();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...updates } });
  },
}));

export const useAuthStore = useAuth;
