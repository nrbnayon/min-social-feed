import Expo, { type ExpoPushMessage, type ExpoPushTicket } from "expo-server-sdk";

const expo = new Expo();

const LOG_TAG = "[ExpoPush]";

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: "default" | null;
  channelId?: string;
}

/**
 * Send a push notification to a single Expo push token.
 * Fire-and-forget safe — never throws, only logs.
 */
export async function sendPushNotification(
  expoPushToken: string,
  payload: PushPayload
): Promise<void> {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.warn(`${LOG_TAG} Invalid Expo push token: ${expoPushToken}`);
    return;
  }

  const message: ExpoPushMessage = {
    to: expoPushToken,
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    sound: payload.sound ?? "default",
    badge: payload.badge ?? 1,
    channelId: payload.channelId ?? "default",
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...chunkTickets);
    }

    // Log any errors from Expo without crashing
    for (const ticket of tickets) {
      if (ticket.status === "error") {
        console.warn(`${LOG_TAG} Push delivery error:`, ticket.message, ticket.details);
      }
    }
  } catch (error) {
    console.error(`${LOG_TAG} Failed to send push notification:`, error);
  }
}

/**
 * Send push notifications to multiple tokens in batched chunks.
 * Fire-and-forget safe — never throws.
 */
export async function sendBatchPushNotifications(
  expoPushTokens: string[],
  payload: PushPayload
): Promise<void> {
  const validTokens = expoPushTokens.filter((token) => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) {
    console.warn(`${LOG_TAG} No valid Expo push tokens in batch.`);
    return;
  }

  const messages: ExpoPushMessage[] = validTokens.map((to) => ({
    to,
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    sound: payload.sound ?? "default",
    badge: payload.badge ?? 1,
    channelId: payload.channelId ?? "default",
  }));

  try {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of tickets) {
        if (ticket.status === "error") {
          console.warn(`${LOG_TAG} Batch push error:`, ticket.message);
        }
      }
    }
  } catch (error) {
    console.error(`${LOG_TAG} Batch push failed:`, error);
  }
}
