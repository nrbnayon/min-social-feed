import axios from "axios";
import { API_URL } from "@/constants/config";
import { storage } from "@/lib/storage";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to sanitize payload for dev logging (hide passwords)
const sanitizeData = (data: any) => {
  if (!data || typeof data !== "object") return data;
  const clone = { ...data };
  if ("password" in clone) clone.password = "******";
  return clone;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Developer logging (only active in development)
  if (__DEV__) {
    const method = (config.method || "GET").toUpperCase();
    const url = config.url || "";
    console.log(
      `🌐 [API REQ] ${method} ${config.baseURL}${url}`,
      config.params ? { params: config.params } : "",
      config.data ? { body: sanitizeData(config.data) } : ""
    );
  }

  return config;
});

// ─── Response Interceptor: Auto-Refresh & Dev Logs ────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      const status = response.status;
      const method = (response.config.method || "GET").toUpperCase();
      const url = response.config.url || "";
      console.log(
        `✅ [API RES ${status}] ${method} ${url}`,
        response.data ? { data: response.data } : ""
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (__DEV__) {
      const status = error.response?.status || "NETWORK_ERR";
      const method = (originalRequest?.method || "GET").toUpperCase();
      const url = originalRequest?.url || "";
      const errorData = error.response?.data;
      console.warn(
        `❌ [API ERR ${status}] ${method} ${url}:`,
        errorData?.error?.message || errorData?.message || error.message,
        errorData ? { responseData: errorData } : ""
      );
    }

    // If 401 error and not already retried and not a login/register/refresh request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        await storage.clearAll();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post<{
          data: { accessToken: string; refreshToken: string };
        }>(`${API_URL}/auth/refresh-token`, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        await storage.setToken(accessToken);
        if (newRefreshToken) {
          await storage.setRefreshToken(newRefreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await storage.clearAll();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
