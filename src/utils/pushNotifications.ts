import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { pushTokenApi } from "../api/pushTokenApi";
import { darkColors } from "../constants/darkColors";

const EXPO_PUSH_TOKEN_KEY = "expo_push_token";

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  const isExpoGo = Constants.appOwnership === "expo";
  console.log("appOwnership:", Constants.appOwnership);
  console.log("expoGoConfig:", Constants.expoGoConfig);
  console.log("expoVersion:", Constants.expoVersion);
  console.log("executionEnvironment:", Constants.executionEnvironment);

  if (Platform.OS === "android" && isExpoGo) {
    console.log(
      "Remote push notifications không hoạt động trong Expo Go Android SDK 53+. Hãy dùng Development Build/APK.",
    );
    return null;
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("auction-alerts", {
      name: "Auction Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: darkColors.primary,
      sound: "auction_alert.wav",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      "Expo projectId not found. Run EAS init/build before testing push notifications.",
    );
  }

  const expoPushToken = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, expoPushToken);

  return expoPushToken;
}

export async function syncPushTokenWithBackend(): Promise<string | null> {
  const token = await registerForPushNotificationsAsync();

  if (!token) {
    return null;
  }
  console.log("Expo Push Token:", token);
  await pushTokenApi.registerPushToken(token);

  return token;
}

export async function getStoredExpoPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
}

export async function unregisterPushTokenFromBackend(): Promise<void> {
  const token = await getStoredExpoPushToken();

  if (!token) {
    return;
  }

  await pushTokenApi.unregisterPushToken(token);
}
