import type { RequestHandler } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notification.service.js";
import { sendSuccess } from "../utils/api-response.js";

// ─── GET /api/notifications ───────────────────────────────────────────────────

export const getNotificationsController: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.user!._id.toString();
    const result = await getNotifications(userId);
    return sendSuccess(response, result, "Notifications fetched successfully.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/notifications/:id/read ────────────────────────────────────────

export const markReadController: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.user!._id.toString();
    const result = await markNotificationRead(String(request.params.id), userId);
    return sendSuccess(response, result, "Notification marked as read.", 200);
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/notifications/read-all ────────────────────────────────────────

export const markAllReadController: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.user!._id.toString();
    const result = await markAllNotificationsRead(userId);
    return sendSuccess(response, result, "All notifications marked as read.", 200);
  } catch (error) {
    next(error);
  }
};
