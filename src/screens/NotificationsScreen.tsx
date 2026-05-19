import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { getApiErrorMessage, isUnauthorizedError } from "../api/client";
import { notificationApi } from "../api/notificationApi";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { NotificationItem } from "../components/NotificationItem";
import { Screen } from "../components/Screen";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type { AppNotification } from "../types/notification";
import { removeAuthTokens } from "../utils/auth";

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(
    async (silent = false) => {
      try {
        setErrorMessage("");

        if (!silent) {
          setLoading(true);
        }

        const data = await notificationApi.getMyNotifications();
        setNotifications(data);
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          await removeAuthTokens();
          router.replace("/login");
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Không thể tải notifications."),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  const handleMarkRead = async (notification: AppNotification) => {
    if (notification.is_read) return;

    try {
      const updated = await notificationApi.markAsRead(notification.id);

      setNotifications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const renderNotification = ({ item }: { item: AppNotification }) => {
    return <NotificationItem notification={item} onPress={handleMarkRead} />;
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.is_read).length;
  }, [notifications]);

  const handleMarkAll = async () => {
    setMarkingAll(true);

    try {
      await notificationApi.markAllAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        })),
      );
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setMarkingAll(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadNotifications(true);
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Đang tải notifications..." />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screenContent}>
      <FlatList
        renderItem={renderNotification}
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={darkColors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Auction Alerts</Text>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>
                Review auction results, outbid alerts, and seller updates.
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{notifications.length}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </Card>

              <Card style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{unreadCount}</Text>
                <Text style={styles.summaryLabel}>Unread</Text>
              </Card>
            </View>

            {unreadCount > 0 ? (
              <AppButton
                title="Mark All as Read"
                onPress={handleMarkAll}
                loading={markingAll}
                variant="secondary"
                style={styles.markAllButton}
              />
            ) : null}

            {errorMessage ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorTitle}>
                  Unable to load notifications
                </Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !errorMessage ? (
            <EmptyState
              title="No notifications yet"
              message="Winning alerts, outbid updates, and auction results will appear here."
              actionTitle="Browse Auctions"
              onActionPress={() => router.push("/auctions")}
              style={styles.emptyState}
            />
          ) : null
        }
        ListFooterComponent={<View style={styles.footer} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  markAllButton: {
    marginBottom: spacing.xl,
  },

  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
  },
  summaryNumber: {
    color: darkColors.primary,
    fontSize: 30,
    fontWeight: "900",
  },
  summaryLabel: {
    color: darkColors.muted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  emptyState: {
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 22,
    marginTop: spacing.lg,
  },

  footer: {
    height: spacing.xl,
  },
  errorCard: {
    borderColor: darkColors.danger,
    marginBottom: spacing.xl,
  },
  errorTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  errorMessage: {
    color: darkColors.muted,
    fontSize: typography.body,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  screenContent: {
    paddingBottom: 0,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },

  header: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: darkColors.primary,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    color: darkColors.text,
    fontSize: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: darkColors.muted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
});
