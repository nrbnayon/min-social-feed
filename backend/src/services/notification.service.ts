import { AppError } from "../utils/app-error.js";

export const getNotifications = async (_userId: string) => {
  throw new AppError("Notifications are not yet implemented.", 501);
};

export const markNotificationRead = async (_notificationId: string, _userId: string) => {
  throw new AppError("Notifications are not yet implemented.", 501);
};

export const markAllNotificationsRead = async (_userId: string) => {
  throw new AppError("Notifications are not yet implemented.", 501);
};
