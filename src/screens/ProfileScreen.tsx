import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { authApi } from "../api/authApi";
import { getApiErrorMessage, isUnauthorizedError } from "../api/client";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type { User } from "../types/auth";
import { removeAuthTokens } from "../utils/auth";
import { logoutCurrentUser } from "../utils/session";

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const avatarLetter = useMemo(() => {
    return (user?.name || user?.email || "U").charAt(0).toUpperCase();
  }, [user]);

  const roleLabel = useMemo(() => {
    if (user?.role === "admin") {
      return "Administrator";
    }

    return "User";
  }, [user]);

  const loadProfile = useCallback(
    async (silent = false) => {
      try {
        setErrorMessage("");

        if (!silent) {
          setLoading(true);
        }

        const currentUser = await authApi.me();
        setUser(currentUser);
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          await removeAuthTokens();
          router.replace("/login");
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Không thể tải thông tin tài khoản."),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadProfile(true);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out of Auction House?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);

            try {
              await logoutCurrentUser();
            } finally {
              setLoggingOut(false);
              router.replace("/login");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Đang tải hồ sơ tài khoản..." />
      </Screen>
    );
  }

  if (errorMessage || !user) {
    return (
      <Screen>
        <View style={styles.centerContent}>
          <EmptyState
            title="Profile unavailable"
            message={errorMessage || "Unable to load your account."}
            actionTitle="Try Again"
            onActionPress={() => loadProfile()}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={darkColors.primary}
          />
        }>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Account Center</Text>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Manage your Auction House identity, activity, and account access.
          </Text>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              {user.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              )}
            </View>

            <View style={styles.profileIdentity}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaGrid}>
            <ProfileMetaItem label="Role" value={roleLabel} />
            <ProfileMetaItem label="User ID" value={`#${user.id}`} />
          </View>

          {user.phone ? (
            <View style={styles.singleMetaRow}>
              <Text style={styles.singleMetaLabel}>Phone</Text>
              <Text style={styles.singleMetaValue}>{user.phone}</Text>
            </View>
          ) : null}
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Navigation</Text>
        </View>

        <View style={styles.quickGrid}>
          <ProfileActionCard
            title="Notifications"
            subtitle="Auction alerts"
            symbol="!"
            onPress={() => router.push("/me/notifications")}
          />

          <ProfileActionCard
            title="My Auctions"
            subtitle="Manage items you listed"
            symbol="◫"
            onPress={() => router.push("/me/auctions")}
          />

          <ProfileActionCard
            title="My Bids"
            subtitle="Review your bid history"
            symbol="$"
            onPress={() => router.push("/me/bids")}
          />

          <ProfileActionCard
            title="Watchlist"
            subtitle="Saved auctions"
            symbol="★"
            onPress={() => router.push("/me/watchlist")}
          />

          <ProfileActionCard
            title="Create Auction"
            subtitle="List a new product"
            symbol="+"
            onPress={() => router.push("/auctions/create")}
          />
        </View>

        {user.role === "admin" ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Administration</Text>
            </View>

            <Card style={styles.adminCard}>
              <View style={styles.adminHeader}>
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>

                <View style={styles.adminTextBox}>
                  <Text style={styles.adminTitle}>Admin Dashboard</Text>
                  <Text style={styles.adminSubtitle}>
                    Review system metrics, users, and auctions.
                  </Text>
                </View>
              </View>

              <AppButton
                title="Open Admin Dashboard"
                onPress={() => router.push("/admin")}
                style={styles.adminButton}
              />
            </Card>
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Session</Text>
        </View>

        <Card style={styles.logoutCard}>
          <Text style={styles.logoutTitle}>Logout</Text>
          <Text style={styles.logoutMessage}>
            This removes your local access token and returns you to the login
            screen.
          </Text>

          <AppButton
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            loading={loggingOut}
            style={styles.logoutButton}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

type ProfileMetaItemProps = {
  label: string;
  value: string;
};

function ProfileMetaItem({ label, value }: ProfileMetaItemProps) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

type ProfileActionCardProps = {
  title: string;
  subtitle: string;
  symbol: string;
  onPress: () => void;
};

function ProfileActionCard({
  title,
  subtitle,
  symbol,
  onPress,
}: ProfileActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionPressable,
        pressed && styles.actionPressed,
      ]}>
      <Card style={styles.actionCard}>
        <Text style={styles.actionSymbol}>{symbol}</Text>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
  },

  topBar: {
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
  },
  backText: {
    color: darkColors.primary,
    fontSize: typography.body,
    fontWeight: "900",
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

  profileCard: {
    marginBottom: spacing.xl,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    marginRight: spacing.lg,
    overflow: "hidden",
  },
  avatarText: {
    color: darkColors.primary,
    fontSize: 34,
    fontWeight: "900",
  },
  profileIdentity: {
    flex: 1,
  },
  name: {
    color: darkColors.text,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  email: {
    color: darkColors.muted,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: darkColors.border,
    marginVertical: spacing.lg,
  },

  metaGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metaItem: {
    flex: 1,
    backgroundColor: darkColors.surfaceSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkColors.border,
    padding: spacing.md,
  },
  metaLabel: {
    color: darkColors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  metaValue: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  singleMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  singleMetaLabel: {
    color: darkColors.muted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  singleMetaValue: {
    color: darkColors.text,
    fontSize: typography.caption,
    fontWeight: "900",
  },

  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionPressable: {
    width: "47.8%",
  },
  actionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  actionCard: {
    minHeight: 150,
    justifyContent: "space-between",
  },
  actionSymbol: {
    color: darkColors.primary,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  actionTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  actionSubtitle: {
    color: darkColors.muted,
    fontSize: typography.caption,
    lineHeight: 19,
    marginTop: spacing.xs,
  },

  adminCard: {
    marginBottom: spacing.xl,
    borderColor: darkColors.primary,
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  adminBadge: {
    borderRadius: 999,
    backgroundColor: darkColors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  adminBadgeText: {
    color: darkColors.textInverse,
    fontSize: typography.small,
    fontWeight: "900",
  },
  adminTextBox: {
    flex: 1,
  },
  adminTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  adminSubtitle: {
    color: darkColors.muted,
    fontSize: typography.caption,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  adminButton: {
    marginTop: spacing.lg,
  },

  logoutCard: {
    borderColor: darkColors.danger,
  },
  logoutTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  logoutMessage: {
    color: darkColors.muted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});
