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