import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PUSH_TOKEN_KEY = "push_token";

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request permission + get push token
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications only work on real devices");
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Ask if not granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied");
    return null;
  }

  // Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "PesakaApp",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1D9E75",
      sound: "default",
    });
  }

  // Get token
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    console.log("Push token:", token);
    return token;
  } catch (e) {
    console.log("Could not get push token:", e);
    return null;
  }
}

export async function getSavedPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}

// ── Local notifications (no server needed) ────────────────

// Send immediately
export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null, // fire immediately
  });
}

// Schedule for later
export async function scheduleNotification(
  title: string,
  body: string,
  seconds: number,
) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  });
}

// Weekly report — every Monday 9am
export async function scheduleWeeklyReport() {
  // Cancel existing first
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📊 Your weekly report is ready",
      body:  "Tap to see how you spent this week.",
      sound: true,
    },
    trigger: {
      type:    Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 2,   // Monday (1=Sun, 2=Mon)
      hour:    9,
      minute:  0,
    },
  });
}

// Transaction saved notification
export async function notifyTransactionSaved(amount: number, type: "income" | "expense") {
  const settings = await AsyncStorage.getItem("notificationSettings");
  const parsed   = settings ? JSON.parse(settings) : { transactionAlerts: true };
  if (!parsed.transactionAlerts) return;

  const symbol = type === "income" ? "+" : "-";
  await sendLocalNotification(
    type === "income" ? "💰 Income recorded" : "💸 Expense recorded",
    `${symbol}₵${Math.abs(amount).toFixed(2)} has been saved to your history.`,
  );
}