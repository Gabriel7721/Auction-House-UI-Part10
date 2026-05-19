import { Platform } from "react-native";
import apiClient from "./client";

type RegisterPushTokenRequest = {
  expo_push_token: string;
  platform: string;
};

type UnregisterPushTokenRequest = {
  expo_push_token: string;
};

type MessageResponse = {
  message: string;
};

export const pushTokenApi = {
  async registerPushToken(expoPushToken: string): Promise<MessageResponse> {
    const payload: RegisterPushTokenRequest = {
      expo_push_token: expoPushToken,
      platform: Platform.OS,
    };
    const response = await apiClient.post<MessageResponse>(
      "/me/push-token",
      payload,
    );

    return response.data;
  },

  async unregisterPushToken(expoPushToken: string): Promise<MessageResponse> {
    const payload: UnregisterPushTokenRequest = {
      expo_push_token: expoPushToken,
    };

    const response = await apiClient.delete<MessageResponse>("/me/push-token", {
      data: payload,
    });

    return response.data;
  },

  async sendTestPushNotification(): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      "/me/push-token/test",
    );

    return response.data;
  },
};