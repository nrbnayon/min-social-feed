import { create } from "zustand";
import type { RegisterInput, User } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { storage } from "@/lib/storage";

type AuthState = { user: User | null; token: string | null; isAuthenticated: boolean; isLoading: boolean; initialize: () => Promise<void>; login: (email: string, password: string) => Promise<void>; register: (input: RegisterInput) => Promise<void>; logout: () => Promise<void> };

export const useAuth = create<AuthState>((set) => ({
  user: null, token: null, isAuthenticated: false, isLoading: true,
  initialize: async () => set({ isLoading: false }),
  login: async (email, password) => { const result = await authService.login(email, password); await storage.setToken(result.token); set({ ...result, isAuthenticated: true, isLoading: false }); },
  register: async (input) => { const result = await authService.register(input); await storage.setToken(result.token); set({ ...result, isAuthenticated: true, isLoading: false }); },
  logout: async () => { await storage.clearToken(); set({ user: null, token: null, isAuthenticated: false, isLoading: false }); },
}));
