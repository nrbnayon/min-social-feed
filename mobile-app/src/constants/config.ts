import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resolves the backend API base URL automatically:
 * 1. If running in Expo Go on a physical device, dynamically extracts the PC's host IP
 *    from Expo Constants (e.g. 10.210.66.134:8081 -> http://10.210.66.134:5000/api).
 * 2. Uses EXPO_PUBLIC_API_URL if explicitly defined and not localhost.
 * 3. Falls back to LAN IP or localhost for web/simulators.
 */
function getApiUrl(): string {
  // Check if env variable is set to a non-localhost remote/LAN URL
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }

  // Dynamic host extraction from Expo development server
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(":")[0];
    if (hostIp) {
      return `http://${hostIp}:5000/api`;
    }
  }

  // Android emulator loopback alias
  if (Platform.OS === "android") {
    return "http://10.210.66.134:5000/api";
  }

  // Web & iOS Simulator
  return "http://localhost:5000/api";
}

export const API_URL = getApiUrl();
