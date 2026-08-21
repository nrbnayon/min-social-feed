import type { RequestHandler } from "express";
import {
  login,
  register,
  getMe,
  refreshUserToken,
  editProfile,
  logoutUser,
} from "../services/auth.service.js";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  saveDeviceToken,
} from "../services/notification.service.js";
import { sendSuccess } from "../utils/api-response.js";

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export const registerController: RequestHandler = async (req, res, next) => {
  try {
    const result = await register(req.body);
    return sendSuccess(res, result, "Account registered successfully.", 201);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const result = await login(req.body);
    return sendSuccess(res, result, "Logged in successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/get-me & /api/auth/me ──────────────────────────────────────

export const getMeController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const result = await getMe(userId);
    return sendSuccess(res, result, "User profile fetched successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/refresh-token ─────────────────────────────────────────────

export const refreshTokenController: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshUserToken(refreshToken);
    return sendSuccess(res, result, "Token refreshed successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── PUT/PATCH /api/auth/edit-profile ─────────────────────────────────────────

export const editProfileController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const result = await editProfile(userId, req.body);
    return sendSuccess(res, result, "Profile updated successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const { refreshToken } = req.body;
    const result = await logoutUser(userId, refreshToken);
    return sendSuccess(res, result, "Logged out successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/device-token ──────────────────────────────────────────────

/**
 * Saves the device's Expo push token to the authenticated user's profile.
 * Called by the mobile app immediately after login / register.
 */
export const registerDeviceTokenController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const { expoPushToken } = req.body;
    await saveDeviceToken(userId, expoPushToken);
    return sendSuccess(res, null, "Device token registered successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/notifications ─────────────────────────────────────────────

export const getNotificationsController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const [result, unreadCount] = await Promise.all([
      getNotifications(userId, page, limit),
      getUnreadCount(userId),
    ]);
    return sendSuccess(res, { ...result, unreadCount }, "Notifications fetched successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/auth/notifications/:id/read ──────────────────────────────────

export const markNotificationReadController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const notification = await markNotificationRead(String(req.params.id), userId);
    return sendSuccess(res, { notification }, "Notification marked as read.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/auth/notifications/read-all ──────────────────────────────────

export const markAllReadController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!._id.toString();
    const result = await markAllNotificationsRead(userId);
    return sendSuccess(res, result, "All notifications marked as read.", 200);
  } catch (error) {
    next(error);
  }
};
