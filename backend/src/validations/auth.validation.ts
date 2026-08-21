import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name cannot exceed 60 characters")
    .trim(),
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .toLowerCase()
    .trim(),
  email: z
    .string()
    .email("Invalid email address format")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password cannot exceed 128 characters"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email or username is required")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});

export const editProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name cannot exceed 60 characters")
    .trim()
    .optional(),
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .toLowerCase()
    .trim()
    .optional(),
  bio: z
    .string()
    .max(300, "Bio cannot exceed 300 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location cannot exceed 100 characters")
    .optional(),
  website: z
    .string()
    .max(200, "Website URL cannot exceed 200 characters")
    .optional(),
  avatar: z
    .string()
    .optional(),
  coverImage: z
    .string()
    .optional(),
});

export const deviceTokenSchema = z.object({
  expoPushToken: z
    .string()
    .min(1, "Expo push token is required")
    .startsWith("ExponentPushToken[", "Must be a valid Expo push token"),
});
