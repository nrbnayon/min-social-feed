import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

export interface PushNotificationState {
  notification: Notifications.Notification | undefined;
  unreadCount: number;
  clearUnreadCount: () => void;
}

/**
 * usePushNotifications
 *
 * Attaches foreground and response listeners.
 * The setNotificationHandler is already called at module level
 * in pushNotifications.ts — we MUST NOT call it here again.
 *
 * Handles deep-link routing when the user taps a notification:
 *   type === 'like' | 'comment'  →  navigate to /(protected)/post/[postId]
 */
export const usePushNotifications = (): PushNotificationState => {
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // ── Foreground notification received ──────────────────────────────────────
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (incomingNotification) => {
        setNotification(incomingNotification);
        setUnreadCount((prev) => prev + 1);
      }
    );

    // ── User tapped a notification (foreground or background) ─────────────────
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<
          string,
          unknown
        >;

        const postId = data?.postId as string | undefined;
        const type = data?.type as "like" | "comment" | undefined;

        if (postId && (type === "like" || type === "comment")) {
          // Navigate to the post that was liked or commented on
          router.push(`/(protected)/post/${postId}` as any);
        }
      }
    );

    // ── Handle notification that launched the app from killed state ───────────
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data as Record<
        string,
        unknown
      >;
      const postId = data?.postId as string | undefined;
      const type = data?.type as "like" | "comment" | undefined;
      if (postId && (type === "like" || type === "comment")) {
        // Small delay to let navigation stack mount
        setTimeout(() => {
          router.push(`/(protected)/post/${postId}` as any);
        }, 500);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const clearUnreadCount = () => setUnreadCount(0);

  return { notification, unreadCount, clearUnreadCount };
};