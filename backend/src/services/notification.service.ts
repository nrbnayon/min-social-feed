import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { AppError } from "../utils/app-error.js";
import { sendPushNotification } from "./expo-push.service.js";
import { pagination } from "../utils/pagination.js";
import { logger } from "../utils/logger.js";
import type { PaginatedResponse } from "../types/post.types.js";
import type { NotificationDocument, NotificationType } from "../models/Notification.js";

// ─── Create + Send Notification ───────────────────────────────────────────────

/**
 * Creates a persisted notification and fires a push notification to the
 * recipient's device. Safe to call fire-and-forget (never throws).
 *
 * @param recipientId - Post author who receives the notification
 * @param senderId    - User who performed the action (like / comment)
 * @param type        - 'like' | 'comment'
 * @param postId      - The post that was interacted with
 */
export const createAndSendNotification = async (
  recipientId: string,
  senderId: string,
  type: NotificationType,
  postId: string
): Promise<void> => {
  try {
    const rId = String(recipientId);
    const sId = String(senderId);
    const pId = String(postId);

    // Never notify yourself
    if (!rId || !sId || rId === sId) {
      logger.debug(`[NotificationService] Skipping self-notification for user ${sId}`);
      return;
    }

    // Fetch sender profile + recipient's push token in parallel
    const [sender, recipient, post] = await Promise.all([
      User.findById(sId).select("username name avatar"),
      User.findById(rId).select("expoPushToken"),
      Post.findById(pId).select("content"),
    ]);

    if (!sender || !recipient) {
      logger.warn(`[NotificationService] Notification skipped: sender or recipient not found (sender: ${sId}, recipient: ${rId})`);
      return;
    }

    // Persist notification to DB
    const savedNotification = await Notification.create({
      recipient: rId,
      sender: sId,
      type,
      post: pId,
      read: false,
    });

    logger.info(`[NotificationService] Notification created (id: ${savedNotification._id}, type: ${type}, from: @${sender.username} -> to: ${rId})`);

    // Build human-readable push payload
    const senderHandle = `@${sender.username}`;
    const title =
      type === "like"
        ? `${senderHandle} liked your post`
        : `${senderHandle} commented on your post`;

    const postPreview = post?.content
      ? `"${post.content.slice(0, 60)}${post.content.length > 60 ? "…" : ""}"`
      : "";

    const body =
      type === "like"
        ? postPreview || "Your post is getting attention! ❤️"
        : postPreview || "Someone replied to your post 💬";

    // Send push only if the recipient has a registered token
    if (recipient.expoPushToken) {
      logger.info(`[NotificationService] Sending ${type} push to token: ${recipient.expoPushToken}`);
      await sendPushNotification(recipient.expoPushToken, {
        title,
        body,
        data: {
          type,
          postId: pId,
          senderId: sId,
          senderUsername: sender.username,
        },
        badge: 1,
        sound: "default",
        channelId: "default",
      });
    } else {
      logger.debug(`[NotificationService] No Expo push token for recipient ${rId}`);
    }
  } catch (error) {
    // Never crash the main request because of a notification failure
    logger.error("[NotificationService] createAndSendNotification failed:", error);
  }
};

// ─── Save Device Token ─────────────────────────────────────────────────────────

/**
 * Saves (or updates) the Expo push token for the authenticated user.
 */
export const saveDeviceToken = async (
  userId: string,
  expoPushToken: string
): Promise<void> => {
  await User.findByIdAndUpdate(userId, { expoPushToken });
};

// ─── Get Notifications (paginated) ────────────────────────────────────────────

export const getNotifications = async (
  userId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<NotificationDocument>> => {
  const { page: safePage, limit: safeLimit } = pagination(page, limit);

  const [items, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate("sender", "id username name avatar avatarUrl")
      .populate("post", "id content images")
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    Notification.countDocuments({ recipient: userId }),
  ]);

  return {
    items: items as unknown as NotificationDocument[],
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: safePage * safeLimit < total,
    },
  };
};

// ─── Unread Count ──────────────────────────────────────────────────────────────

export const getUnreadCount = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ recipient: userId, read: false });
};

// ─── Mark Single Notification Read ────────────────────────────────────────────

export const markNotificationRead = async (
  notificationId: string,
  userId: string
): Promise<NotificationDocument> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { returnDocument: "after" }
  );
  if (!notification) {
    throw new AppError("Notification not found.", 404);
  }
  return notification;
};

// ─── Mark All Notifications Read ──────────────────────────────────────────────

export const markAllNotificationsRead = async (userId: string): Promise<{ updated: number }> => {
  const result = await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
  return { updated: result.modifiedCount };
};
