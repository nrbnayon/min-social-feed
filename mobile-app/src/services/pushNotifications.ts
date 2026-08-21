/**
 * pushNotifications.ts
 *
 * Core push notification service for MiniSocial.
 * Handles: permission requests, Expo push token registration,
 * Android channel creation, foreground presentation handler,
 * background task registration, and token upload to backend.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

export const BACKGROUND_NOTIFICATION_TASK = "MINISOCIAL_BACKGROUND_NOTIFICATION";

const LOG_TAG = "[Notifications]";

// ─── Debug logger ─────────────────────────────────────────────────────────────

function log(message: string, data?: unknown) {
  if (__DEV__) {
    data !== undefined
      ? console.log(`${LOG_TAG} ${message}`, JSON.stringify(data, null, 2))
      : console.log(`${LOG_TAG} ${message}`);
  }
}

function warn(message: string, error?: unknown) {
  console.warn(`${LOG_TAG} ⚠️  ${message}`, error ?? "");
}

function err(message: string, error?: unknown) {
  console.error(`${LOG_TAG} ❌  ${message}`, error ?? "");
}

// ─── Foreground handler (module level — must not be inside a component/hook) ──

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    log("Foreground notification received:", {
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
    });
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
  handleSuccess: (notificationId) => {
    log(`Handled successfully — id: ${notificationId}`);
  },
  handleError: (notificationId, error) => {
    err(`Handling failed — id: ${notificationId}`, error);
  },
});

// ─── Background task definition (module level) ────────────────────────────────

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody): Promise<void> => {
    if (error) {
      err("Background notification task error:", error);
      return;
    }
    log("Background notification task fired:", data);
    const payload = data as Record<string, unknown>;
    const isUserResponse =
      payload !== null &&
      typeof payload === "object" &&
      "actionIdentifier" in payload;
    if (isUserResponse) {
      log("User interacted with notification in background:", {
        actionIdentifier: payload.actionIdentifier,
        notification: payload.notification,
      });
    } else {
      log("Background data-only notification received:", payload);
    }
  }
);

// ─── Android notification channels ───────────────────────────────────────────

async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== "android") return;
  log("Setting up Android notification channels…");

  await Notifications.setNotificationChannelAsync("default", {
    name: "General",
    description: "Likes, comments, and general notifications",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#6366F1",
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync("alerts", {
    name: "Alerts",
    description: "Important alerts and action items",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 500, 200, 500],
    lightColor: "#EF4444",
    showBadge: true,
  });

  log("Android notification channels created: [default, alerts]");
}

// ─── Permission request ───────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  log("Requesting notification permissions…");
  await setupAndroidChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  log(`Current permission status: ${existingStatus}`);

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    log("Permissions not yet granted — prompting user…");
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowProvisional: false,
      },
    });
    finalStatus = status;
    log(`Permission response status: ${finalStatus}`);
  }

  if (finalStatus !== "granted") {
    warn(`Notification permissions denied (status: ${finalStatus})`);
    return false;
  }

  log("Notification permissions GRANTED ✅");
  return true;
}

// ─── Token registration ───────────────────────────────────────────────────────

/**
 * Requests permissions, sets up channels, and obtains an Expo push token.
 * Returns null if permissions are denied or device is a simulator.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  log("Starting push notification registration…");

  if (!Device.isDevice) {
    warn("Push notifications require a physical device — skipping on simulator.");
    return null;
  }

  const permissionGranted = await requestNotificationPermissions();
  if (!permissionGranted) return null;

  const projectId: string | undefined =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    warn(
      "No EAS projectId found. " +
      'Add "extra": { "eas": { "projectId": "<your-id>" } } to app.json ' +
      "or run `eas build:configure`."
    );
  }

  log(`Using EAS projectId: ${projectId ?? "(none — local/dev mode)"}`);

  try {
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : {}
    );
    log(`✅ Expo push token obtained: ${expoPushToken}`);
    return expoPushToken;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("FirebaseApp") || msg.toLowerCase().includes("firebase")) {
      warn(
        "Push token unavailable — dev build lacks EAS-injected FCM credentials.\n" +
        "Fix: rebuild with  eas build --profile development --platform android"
      );
    } else {
      err("Failed to get Expo push token:", error);
    }
    return null;
  }
}

// ─── Background task registration ────────────────────────────────────────────

export async function registerBackgroundNotificationTask(): Promise<void> {
  if (!Device.isDevice) {
    log("Skipping background task registration on simulator.");
    return;
  }
  if (Constants.appOwnership === "expo") {
    log("Skipping background task registration in Expo Go (requires standalone build).");
    return;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    if (isRegistered) {
      log(`Background task "${BACKGROUND_NOTIFICATION_TASK}" already registered.`);
      return;
    }
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    log(`Background task "${BACKGROUND_NOTIFICATION_TASK}" registered ✅`);
  } catch (error) {
    warn("Background notification task registration skipped or unsupported:", error);
  }
}

// ─── Save token to backend ────────────────────────────────────────────────────

/**
 * Uploads the Expo push token to the backend so the server can send
 * targeted push notifications to this device.
 *
 * @param expoPushToken - The token returned by registerForPushNotificationsAsync()
 * @param authToken     - The user's access token (Bearer)
 * @param apiBaseUrl    - Base URL of the backend (e.g. http://localhost:5000/api)
 */
export async function savePushTokenToBackend(
  expoPushToken: string,
  authToken: string,
  apiBaseUrl: string
): Promise<void> {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/device-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ expoPushToken }),
    });

    if (!response.ok) {
      const body = await response.text();
      warn(`Failed to save push token to backend (${response.status}):`, body);
      return;
    }

    log("✅ Push token saved to backend.");
  } catch (error) {
    warn("Failed to reach backend for push token registration:", error);
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export async function clearBadge(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
    log("Badge count cleared.");
  } catch (error) {
    warn("Failed to clear badge:", error);
  }
}

// ─── Local push token cache ───────────────────────────────────────────────────
// We store the Expo push token in AsyncStorage immediately after receiving it
// (at app boot, before any auth). Then when the user completes a real login or
// register, we read it and POST it to the backend — correctly linking the token
// to a real database user.

const PUSH_TOKEN_KEY = "minisocial-expo-push-token";

/**
 * Persists the Expo push token to AsyncStorage.
 * Called right after getExpoPushTokenAsync() succeeds.
 */
export async function storePushTokenLocally(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    log(`Push token cached locally: ${token}`);
  } catch (error) {
    warn("Failed to cache push token locally:", error);
  }
}

/**
 * Reads the locally cached Expo push token.
 * Returns null if not yet registered or permission was denied.
 */
export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}
