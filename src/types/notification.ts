export type NotificationType = "auction_won" | "outbid" | "auction_ended";

export type AppNotification = {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type NotificationUnreadCountResponse = {
  unread_count: number;
};
