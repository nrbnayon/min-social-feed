import https from "node:https";
import dns from "node:dns";
import Expo, { type ExpoPushMessage } from "expo-server-sdk";

const LOG_TAG = "[ExpoPush]";

// Ensure IPv4 is prioritized for external push notification services to avoid IPv6 timeouts
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignored if not supported in current node runtime
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: "default" | null;
  channelId?: string;
}

/**
 * Direct HTTPS caller to Expo Push API with IPv4 enforcement and 5s timeout.
 */
async function sendToExpoPushApi(messages: ExpoPushMessage[]): Promise<any> {
  const payload = JSON.stringify(messages);
  const accessToken = process.env.EXPO_ACCESS_TOKEN;

  return new Promise((resolve, reject) => {
    const headers: Record<string, string | number> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Length": Buffer.byteLength(payload),
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const req = https.request(
      {
        hostname: "exp.host",
        port: 443,
        path: "/--/api/v2/push/send",
        method: "POST",
        headers,
        family: 4, // Force IPv4
        timeout: 6000,
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => {
          rawData += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve(parsed);
          } catch {
            resolve({ data: rawData });
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Expo Push API request timed out after 6000ms"));
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Send a push notification to a single Expo push token.
 * Fire-and-forget safe — never throws.
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
    const res = await sendToExpoPushApi([message]);
    const tickets = res?.data || [];
    for (const ticket of Array.isArray(tickets) ? tickets : [tickets]) {
      if (ticket.status === "error") {
        console.warn(`${LOG_TAG} Push delivery ticket error:`, ticket.message, ticket.details);
      } else if (ticket.status === "ok") {
        console.log(`${LOG_TAG} Push notification delivered successfully ✅`);
      }
    }
  } catch (error: any) {
    console.warn(`${LOG_TAG} Push notification dispatch note:`, error.message || error);
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
    const res = await sendToExpoPushApi(messages);
    console.log(`${LOG_TAG} Batch push processed:`, Array.isArray(res?.data) ? `${res.data.length} tickets` : "ok");
  } catch (error: any) {
    console.warn(`${LOG_TAG} Batch push dispatch note:`, error.message || error);
  }
}
