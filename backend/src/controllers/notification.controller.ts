/**
 * Notification endpoints are now consolidated in auth.controller.ts
 * and served under /api/auth/notifications.
 *
 * This file is intentionally left as a passthrough to avoid breaking
 * any existing imports. The notification.routes.ts still mounts at
 * /api/notifications for backward compatibility.
 */

export {
  getNotificationsController,
  markNotificationReadController,
  markAllReadController,
} from "./auth.controller.js";
