import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "mini-social-feed-token";
const REFRESH_TOKEN_KEY = "mini-social-feed-refresh-token";
const USER_KEY = "mini-social-feed-user";

export const storage = {
  // Access token
  getToken: () => AsyncStorage.getItem(ACCESS_TOKEN_KEY),
  setToken: (token: string) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, token),
  clearToken: () => AsyncStorage.removeItem(ACCESS_TOKEN_KEY),

  // Refresh token
  getRefreshToken: () => AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => AsyncStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => AsyncStorage.removeItem(REFRESH_TOKEN_KEY),

  // Cached user profile (for fast session restore without extra API call)
  getUser: async <T>(): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setUser: (user: object) => AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => AsyncStorage.removeItem(USER_KEY),

  // Clear all auth data on logout
  clearAll: () =>
    AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]),
};
