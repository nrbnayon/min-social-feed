import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Platform } from "react-native";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Platform adaptive shadow class: shadow-xs on iOS, shadow-lg on Android */
export const appShadow = Platform.OS === "ios" ? "shadow-xs" : "shadow-lg";
export const platformShadow = (ios = "shadow-xs", android = "shadow-lg") =>
  Platform.OS === "ios" ? ios : android;

/**
 * Formats large numbers into compact social-media friendly strings:
 * Examples:
 *   - 842 -> "842"
 *   - 1,200 -> "1.2K"
 *   - 10,000 -> "10K"
 *   - 28,400 -> "28.4K"
 *   - 1,500,000 -> "1.5M"
 *   - 2,000,000,000 -> "2B"
 */
export function formatCount(count: number | undefined | null): string {
  if (count === undefined || count === null || isNaN(count)) return "0";
  if (count < 1000) return count.toString();

  if (count < 1_000_000) {
    const formatted = (count / 1000).toFixed(1);
    return formatted.endsWith(".0") ? `${formatted.slice(0, -2)}K` : `${formatted}K`;
  }

  if (count < 1_000_000_000) {
    const formatted = (count / 1_000_000).toFixed(1);
    return formatted.endsWith(".0") ? `${formatted.slice(0, -2)}M` : `${formatted}M`;
  }

  const formatted = (count / 1_000_000_000).toFixed(1);
  return formatted.endsWith(".0") ? `${formatted.slice(0, -2)}B` : `${formatted}B`;
}

/**
 * Extracts a clean, user-friendly error message from API errors or exceptions.
 */
export function extractErrorMessage(
  error: any,
  fallback = "Something went wrong. Please try again."
): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  // 1. Backend structured error message
  const backendMsg =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    (typeof error?.response?.data?.error === "string" ? error?.response?.data?.error : undefined);

  if (backendMsg && typeof backendMsg === "string") {
    return backendMsg;
  }

  // 2. HTTP status code based fallbacks
  const status = error?.response?.status;
  if (status === 401) {
    return "Invalid email or password. Please check your credentials.";
  }
  if (status === 400) {
    return "Please verify your input and try again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return "Resource or user account not found.";
  }
  if (status === 409) {
    return "An account with this username or email already exists.";
  }
  if (status === 422) {
    return "Validation error. Please check your details.";
  }
  if (status >= 500) {
    return "Server error. Our team has been notified, please try again.";
  }

  // 3. Network connection errors
  if (error?.code === "ECONNABORTED" || error?.message?.toLowerCase().includes("timeout")) {
    return "Request timed out. Please check your internet connection.";
  }
  if (error?.message === "Network Error" || error?.message?.toLowerCase().includes("network")) {
    return "Unable to connect to server. Please check your internet connection.";
  }

  return fallback;
}