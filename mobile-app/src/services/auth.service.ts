import { api } from "./api";
import type { AuthResponse, RegisterInput, User } from "@/types";

export const authService = {
  /**
   * Register a new account.
   * POST /api/auth/register
   */
  register: (input: RegisterInput) =>
    api
      .post<{ data: AuthResponse }>("/auth/register", input)
      .then((res) => res.data.data),

  /**
   * Login with email (or username) + password — JWT auth.
   * POST /api/auth/login
   */
  login: (email: string, password: string) =>
    api
      .post<{ data: AuthResponse }>("/auth/login", { email, password })
      .then((res) => res.data.data),

  /**
   * Fetch the currently authenticated user's profile.
   * GET /api/auth/me
   */
  getMe: () =>
    api
      .get<{ data: { user: User } }>("/auth/me")
      .then((res) => res.data.data.user),

  /**
   * Rotate the access token using a refresh token.
   * POST /api/auth/refresh-token
   */
  refreshToken: (refreshToken: string) =>
    api
      .post<{ data: { accessToken: string; refreshToken: string } }>(
        "/auth/refresh-token",
        { refreshToken }
      )
      .then((res) => res.data.data),

  /**
   * Logout — revokes the refresh token server-side.
   * POST /api/auth/logout
   */
  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken }),

  /**
   * Register the Expo push token for this device.
   * POST /api/auth/device-token
   */
  registerDeviceToken: (expoPushToken: string) =>
    api.post("/auth/device-token", { expoPushToken }),
};
