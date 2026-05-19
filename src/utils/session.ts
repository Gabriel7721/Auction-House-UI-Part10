import { authApi } from "../api/authApi";
import { removeAuthTokens } from "./auth";
import { unregisterPushTokenFromBackend } from "./pushNotifications";

export async function logoutCurrentUser(): Promise<void> {
  try {
    await unregisterPushTokenFromBackend();
  } catch (error) {
    console.log("Failed to unregister push token:", error);
  }

  try {
    await authApi.logout();
  } catch (error) {
    console.log("Backend logout failed:", error);
  }

  await removeAuthTokens();
}
