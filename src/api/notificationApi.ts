import type {
    AppNotification,
    NotificationUnreadCountResponse,
} from "../types/notification";
import apiClient from "./client";

type NotificationListResponse = {
  data: AppNotification[];
};

type NotificationReadResponse = {
  message: string;
  data: AppNotification;
};

type MessageResponse = {
  message: string;
};

export const notificationApi = {
  async getMyNotifications(): Promise<AppNotification[]> {
    const response =
      await apiClient.get<NotificationListResponse>("/me/notifications");

    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<NotificationUnreadCountResponse>(
      "/me/notifications/unread-count",
    );

    return response.data.unread_count;
  },

  async markAsRead(notificationID: number | string): Promise<AppNotification> {
    const response = await apiClient.patch<NotificationReadResponse>(
      `/me/notifications/${notificationID}/read`,
    );

    return response.data.data;
  },

  async markAllAsRead(): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>(
      "/me/notifications/read-all",
    );

    return response.data;
  },
};
