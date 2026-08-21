/**
 * notifications.ts
 *
 * Core push notification service for 1000eyes.
 * Handles: permission requests, Expo push token registration,
 * Android channel creation, foreground presentation handler,
 * background task registration, and deep-link routing from taps.
 *
 * Works in BOTH development and production on iOS & Android.
 */

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

export const BACKGROUND_NOTIFICATION_TASK = "THOUSANDEYES_BACKGROUND_NOTIFICATION";

const LOG_TAG = "[Notifications]";

// ─── Debug logger ─────────────────────────────────────────────────────────────

function log(message: string, data?: unknown) {
  if (__DEV__) {
    if (data !== undefined) {
      console.log(`${LOG_TAG} ${message}`, JSON.stringify(data, null, 2));
    } else {
      console.log(`${LOG_TAG} ${message}`);
    }
  }
}

function warn(message: string, error?: unknown) {
  console.warn(`${LOG_TAG} ⚠️  ${message}`, error ?? "");
}

function err(message: string, error?: unknown) {
  console.error(`${LOG_TAG} ❌  ${message}`, error ?? "");
}

// ─── Foreground notification handler ─────────────────────────────────────────
// Must be called at the module level (outside any component) so it runs
// even when the app is opened fresh from a notification tap.

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    log("Foreground notification received:", {
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
    });

    return {
      shouldShowBanner: true, // Show alert banner on iOS 14+
      shouldShowList: true, // Show in Notification Center list
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
  handleSuccess: (notificationId) => {
    log(`Notification handled successfully — id: ${notificationId}`);
  },
  handleError: (notificationId, error) => {
    err(`Notification handling failed — id: ${notificationId}`, error);
  },
});

// ─── Background task definition ───────────────────────────────────────────────
// Define the task at the module level so TaskManager can find it when the
// JS bundle is loaded headlessly (app terminated / backgrounded).

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody): Promise<void> => {
    if (error) {
      err("Background notification task error:", error);
      return;
    }

    log("Background notification task fired:", data);

    // The payload shape differs: response (user tapped) vs raw notification
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
  },
);

// ─── Android notification channels ───────────────────────────────────────────

async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  log("Setting up Android notification channels…");

  await Notifications.setNotificationChannelAsync("default", {
    name: "General",
    description: "General app notifications",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#208AEF",
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync("alerts", {
    name: "Alerts",
    description: "Important alerts and action items",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 500, 200, 500],
    lightColor: "#FF6B6B",
    showBadge: true,
  });

  log("Android notification channels created: [default, alerts]");
}

// ─── Permission request ───────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  log("Requesting notification permissions…");

  // On Android (13+), setup notification channels before requesting permissions
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

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  log("Starting push notification registration…");

  const permissionGranted = await requestNotificationPermissions();
  if (!permissionGranted) return null;

  // ── Expo Push Notification Service (Approach 1 — no Firebase setup needed) ──
  // Expo's servers act as the FCM/APNs middleman automatically.
  // All you need is your EAS projectId and an Expo push token.
  // Firebase IS used internally by Android, but EAS auto-configures it
  // during `eas build` — you do NOT need to set it up manually.
  //
  // If you see a "FirebaseApp is not initialized" error it means you are
  // running an OLD dev build that was not produced by EAS. Just rebuild:
  //   eas build --profile development --platform android
  // ──────────────────────────────────────────────────────────────────────────

  const projectId: string | undefined =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    warn(
      "No EAS projectId found. " +
      'Add "extra": { "eas": { "projectId": "<your-id>" } } to app.json ' +
      "or run `eas build:configure`.",
    );
  }

  log(`Using EAS projectId: ${projectId ?? "(none — local/dev mode)"}`);

  try {
    // getExpoPushTokenAsync uses Expo's push service — NO manual Firebase setup needed.
    // EAS Build automatically injects google-services.json during the build process.
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : {},
    );

    log(`✅ Expo push token obtained: ${expoPushToken}`);
    return expoPushToken;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    if (
      msg.includes("FirebaseApp") ||
      msg.includes("firebase") ||
      msg.includes("Firebase")
    ) {
      // This is NOT a Firebase credentials problem — it is an OLD BUILD issue.
      // EAS normally auto-injects google-services.json during `eas build`.
      // Your current dev APK was not built by EAS (or the build failed earlier).
      //
      // Fix: run  eas build --profile development --platform android
      //      then install the new APK and open the app again.
      warn(
        "⚠️  Push token unavailable — this dev build lacks EAS-injected FCM credentials.\n" +
        "This is NOT a manual Firebase setup issue. Expo handles Firebase automatically.\n" +
        "Fix: rebuild with  eas build --profile development --platform android",
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
    log("Skipping background task registration on emulator.");
    return;
  }

  // Expo Go client on iOS does not support custom background remote notification tasks
  if (Constants.appOwnership === "expo") {
    log("Skipping background task registration in Expo Go (requires standalone / development build).");
    return;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_NOTIFICATION_TASK,
    );

    if (isRegistered) {
      log(
        `Background task "${BACKGROUND_NOTIFICATION_TASK}" already registered.`,
      );
      return;
    }

    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    log(`Background task "${BACKGROUND_NOTIFICATION_TASK}" registered ✅`);
  } catch (error) {
    warn("Background notification task registration skipped or unsupported:", error);
  }
}

// ─── Utility: schedule a local notification ───────────────────────────────────

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  delaySeconds = 0,
  imageUrl?: string,
): Promise<string | null> {
  log(`Scheduling local notification in ${delaySeconds}s:`, {
    title,
    body,
    data,
    imageUrl,
  });

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data ?? {},
        badge: 1,
        attachments: imageUrl ? [{ identifier: "image", url: imageUrl, type: "image" }] : undefined,
      },
      trigger:
        delaySeconds > 0
          ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: delaySeconds,
          }
          : null,
    });
    log(`Local notification scheduled — id: ${id}`);
    return id;
  } catch (error) {
    err("Failed to schedule local notification:", error);
    return null;
  }
}


// ─── Utility: clear badge ─────────────────────────────────────────────────────

export async function clearBadge(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
    log("Badge count cleared.");
  } catch (error) {
    warn("Failed to clear badge:", error);
  }
}

// ----------------Another solution----------------
// export async function registerForPushNotificationsAsync(): Promise
//   string | null
// > {
//   log("Starting push notification registration…");

//   const permissionGranted = await requestNotificationPermissions();
//   if (!permissionGranted) return null;

//   const projectId: string | undefined =
//     Constants?.expoConfig?.extra?.eas?.projectId ??
//     Constants?.easConfig?.projectId;

//   if (!projectId) {
//     warn(
//       "No EAS projectId found. Add it to app.json under extra.eas.projectId",
//     );
//     return null;
//   }

//   log(`Using EAS projectId: ${projectId}`);

//   // ── Approach 1: Expo Push Token (Firebase optional on your end) ────────────
//   try {
//     const expoPushTokenData = await Notifications.getExpoPushTokenAsync({
//       projectId,
//     });
//     const expoPushToken = expoPushTokenData.data;
//     log(`✅ Expo push token obtained: ${expoPushToken}`);
//     return expoPushToken;
//   } catch (expoTokenError) {
//     const msg =
//       expoTokenError instanceof Error
//         ? expoTokenError.message
//         : String(expoTokenError);

//     warn("Expo push token failed — falling back to device token check…", msg);

//     // ── Approach 2: Firebase/FCM Direct Token (optional fallback) ─────────────
//     if (msg.toLowerCase().includes("firebase") || msg.includes("FCM")) {
//       warn(
//         "Firebase not initialized — FCM credentials required for Android production builds.\n" +
//           "Option A (Recommended): Run `eas build` — Expo injects FCM automatically.\n" +
//           "Option B (Manual): Add google-services.json + configure FCM credentials.\n" +
//           "See: https://docs.expo.dev/push-notifications/fcm-credentials/",
//       );

//       // Still try device token — works on iOS without Firebase
//       if (Platform.OS === "ios") {
//         try {
//           const deviceToken = await Notifications.getDevicePushTokenAsync();
//           log(`iOS APNs device token obtained: ${deviceToken.data}`);
//           // NOTE: This is a raw APNs token — use your own backend to send via APNs
//           // NOT compatible with Expo's push service
//           return deviceToken.data;
//         } catch (iosError) {
//           err("iOS device token also failed:", iosError);
//         }
//       }
//     } else {
//       err("Failed to get Expo push token (non-Firebase error):", expoTokenError);
//     }

//     return null;
//   }
// }
// ```

// ## Root Cause & What You Should Actually Do
// ```
// Your current situation:
// ┌─────────────────────────────────────────────────────────┐
// │  Custom Dev Build / Expo Go                             │
// │  ↓                                                      │
// │  getExpoPushTokenAsync() → hits Expo servers            │
// │  Expo servers → forward to FCM (Google)                 │
// │  FCM → needs google-services.json in your BUILD         │
// │  Missing → ⚠️  Firebase warning                         │
// └─────────────────────────────────────────────────────────┘
