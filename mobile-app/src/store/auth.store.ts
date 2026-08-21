import { create } from "zustand";
import type { RegisterInput, User } from "@/types";
import { authService } from "@/services/auth.service";
import { storage } from "@/lib/storage";
import { CURRENT_USER } from "@/data/seed";
import {
  getStoredPushToken,
  savePushTokenToBackend,
} from "@/services/pushNotifications";
import { API_URL } from "@/constants/config";

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

/**
 * After a REAL login/register, reads the locally cached Expo push token
 * and uploads it to the backend so it's linked to the real DB user.
 *
 * This is intentionally fire-and-forget — a push failure must never
 * block or fail the authentication flow.
 */
async function uploadCachedPushToken(authToken: string): Promise<void> {
  try {
    const expoPushToken = await getStoredPushToken();
    if (expoPushToken) {
      await savePushTokenToBackend(expoPushToken, authToken, API_URL);
    }
  } catch {
    // Silent — push failure should never affect login
  }
}

export const useAuth = create<AuthState>((set, get) => ({
  // Default to demo user so the app is immediately usable.
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
        set({ token: "demo_token_authenticated", isAuthenticated: true, user: CURRENT_USER, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password?: string) => {
    try {
      // Real backend login — creates a session for a real MongoDB user
      const result = await authService.login(email, password || "password123");
      await storage.setToken(result.token);
      set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false });

      // Upload push token to backend — now correctly linked to this real user
      void uploadCachedPushToken(result.token);
    } catch {
      // Backend offline — fall back to local demo profile
      const localUser: User = {
        ...CURRENT_USER,
        email,
        username: email.split("@")[0] || "user",
        name: email.split("@")[0] || "User",
      };
      const localToken = "local_token_" + Date.now();
      await storage.setToken(localToken);
      // Note: push token is NOT uploaded here — no real DB user exists
      set({ user: localUser, token: localToken, isAuthenticated: true, isLoading: false });
    }
  },

  loginDemo: async () => {
    // Demo mode — push notifications intentionally disabled (no real DB user)
    const demoToken = "demo_token_authenticated";
    await storage.setToken(demoToken);
    set({ user: CURRENT_USER, token: demoToken, isAuthenticated: true, isLoading: false });
  },

  register: async (input: RegisterInput) => {
    try {
      // Real backend registration — creates a new MongoDB user document
      const result = await authService.register(input);
      await storage.setToken(result.token);
      set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false });

      // Upload push token to backend — linked to the newly created user
      void uploadCachedPushToken(result.token);
    } catch {
      // Local fallback — no real DB user, push will not work
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
      const localToken = "local_token_" + Date.now();
      await storage.setToken(localToken);
      set({ user: newUser, token: localToken, isAuthenticated: true, isLoading: false });
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
