import { create } from "zustand";
import type { RegisterInput, User } from "@/types";
import { authService } from "@/services/auth.service";
import { storage } from "@/lib/storage";
import {
  getStoredPushToken,
} from "@/services/pushNotifications";
import { API_URL } from "@/constants/config";

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
};

/**
 * After a successful login/register, reads the locally cached Expo push token
 * and uploads it to the backend so it is linked to the real DB user.
 * Fire-and-forget — a push failure must never block the auth flow.
 */
async function uploadCachedPushToken(authToken: string): Promise<void> {
  try {
    const expoPushToken = await getStoredPushToken();
    if (expoPushToken) {
      await fetch(`${API_URL}/auth/device-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ expoPushToken }),
      });
    }
  } catch {
    // Silent — push failure should never affect login
  }
}

export const useAuth = create<AuthState>((set, get) => ({
  // Start unauthenticated — real session is restored in initialize()
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Called once on app boot (from _layout.tsx).
   * Restores a previous session from AsyncStorage without requiring re-login.
   */
  initialize: async () => {
    set({ isLoading: true });
    try {
      const [token, refreshToken, cachedUser] = await Promise.all([
        storage.getToken(),
        storage.getRefreshToken(),
        storage.getUser<User>(),
      ]);

      if (!token) {
        // No stored token → stay on login screen
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Restore from cached user immediately for fast UI
      if (cachedUser) {
        set({ user: cachedUser, token, refreshToken, isAuthenticated: true });
      }

      // Then verify token is still valid by fetching fresh profile
      try {
        const user = await authService.getMe();
        await storage.setUser(user);
        set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
      } catch {
        // Access token expired — try refreshing
        if (refreshToken) {
          try {
            const newTokens = await authService.refreshToken(refreshToken);
            await storage.setToken(newTokens.accessToken);
            await storage.setRefreshToken(newTokens.refreshToken);
            const user = await authService.getMe();
            await storage.setUser(user);
            set({
              user,
              token: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            // Refresh token also invalid → force logout
            await storage.clearAll();
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          // No refresh token → force logout
          await storage.clearAll();
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  /**
   * Login with email (or username) + password.
   * Throws on failure — the UI must handle and display the error.
   */
  login: async (email: string, password: string) => {
    const result = await authService.login(email, password);

    // Persist both tokens
    await storage.setToken(result.accessToken);
    await storage.setRefreshToken(result.refreshToken);
    await storage.setUser(result.user);

    set({
      user: result.user,
      token: result.accessToken,
      refreshToken: result.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });

    // Upload Expo push token to backend — now linked to real DB user
    void uploadCachedPushToken(result.accessToken);
  },

  /**
   * Register a new account.
   * Throws on failure — the UI must handle and display the error.
   */
  register: async (input: RegisterInput) => {
    const result = await authService.register(input);

    // Persist both tokens
    await storage.setToken(result.accessToken);
    await storage.setRefreshToken(result.refreshToken);
    await storage.setUser(result.user);

    set({
      user: result.user,
      token: result.accessToken,
      refreshToken: result.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });

    // Upload Expo push token to backend — linked to newly created user
    void uploadCachedPushToken(result.accessToken);
  },

  /**
   * Logout — revokes refresh token server-side and clears local storage.
   */
  logout: async () => {
    const { refreshToken } = get();
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore server errors — still clear local state
    }
    await storage.clearAll();
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ user: updated });
    void storage.setUser(updated);
  },
}));

export const useAuthStore = useAuth;
