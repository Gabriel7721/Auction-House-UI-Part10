import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "./Card";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type { AppNotification } from "../types/notification";
import { formatDateTime, formatNotificationType } from "../utils/format";

type NotificationItemProps = {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
};

export function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  return (
    <Pressable
      onPress={() => onPress(notification)}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <Card
        style={[
          styles.notificationCard,
          !notification.is_read && styles.unreadCard,
        ]}>
        <View style={styles.notificationHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {formatNotificationType(notification.type)}
            </Text>
          </View>

          {!notification.is_read ? <View style={styles.unreadDot} /> : null}
        </View>

        <Text style={styles.notificationTitle}>{notification.title}</Text>

        <Text style={styles.notificationMessage}>{notification.message}</Text>

        <Text style={styles.notificationDate}>
          {formatDateTime(notification.created_at)}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
  },

  notificationCard: {
    marginBottom: spacing.md,
  },
  unreadCard: {
    borderColor: darkColors.primary,
  },

  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  typeBadge: {
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  typeBadgeText: {
    color: darkColors.primary,
    fontSize: typography.small,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: darkColors.primary,
  },

  notificationTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
    lineHeight: 23,
  },
  notificationMessage: {
    color: darkColors.muted,
    fontSize: typography.caption,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  notificationDate: {
    color: darkColors.textSoft,
    fontSize: typography.small,
    marginTop: spacing.md,
    fontWeight: "700",
  },
});
