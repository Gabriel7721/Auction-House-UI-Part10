import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { auctionApi } from "../api/auctionApi";
import { authApi } from "../api/authApi";
import { getApiErrorMessage, isUnauthorizedError } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AuctionCard } from "../components/AuctionCard";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";

import { QuickActionCard } from "../components/QuickActionCard";
import { SectionHeader } from "../components/SectionHeader";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type { Auction } from "../types/auction";
import type { User } from "../types/auth";
import { removeAuthTokens } from "../utils/auth";
import { logoutCurrentUser } from "../utils/session";

export default function HomeScreen() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [latestAuctions, setLatestAuctions] = useState<Auction[]>([]);
  const [endingSoonAuctions, setEndingSoonAuctions] = useState<Auction[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const userFirstName = useMemo(() => {
    if (!user?.name) return "there";

    return user.name.trim().split(" ")[0];
  }, [user]);

  const loadHomeData = useCallback(async () => {
    setErrorMessage("");

    try {
      const [currentUser, latest, endingSoon] = await Promise.all([
        authApi.me(),
        auctionApi.getLatestAuctions(5),
        auctionApi.getEndingSoonAuctions(5),
      ]);

      setUser(currentUser);
      setLatestAuctions(latest);
      setEndingSoonAuctions(endingSoon);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        await removeAuthTokens();
        router.replace("/login");
        return;
      }

      setErrorMessage(
        getApiErrorMessage(error, "Không thể tải dữ liệu trang chủ."),
      );
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);

      await loadHomeData();

      if (mounted) {
        setLoading(false);
      }
    };

    void init();

    return () => {
      mounted = false;
    };
  }, [loadHomeData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logoutCurrentUser();
    router.replace("/login");
  };

  const goToAuctionDetail = (auctionID: number) => {
    router.push(`/auctions/${auctionID}`);
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Đang tải Auction House..." />
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
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.eyebrow}>Welcome back</Text>
              <Text style={styles.title}>Hi, {userFirstName}</Text>
            </View>

            <View style={styles.avatar}>
              {user?.avatar_url ? (
                <Image
                  source={{
                    uri: user.avatar_url,
                  }}
                  resizeMode="cover"
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.subtitle}>
            Discover live auctions, place secure bids, and track your favorite
            items in one mobile-first marketplace.
          </Text>
        </View>

        {errorMessage ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorTitle}>Unable to load data</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>

            <AppButton
              title="Try Again"
              onPress={handleRefresh}
              variant="secondary"
              style={styles.errorButton}
            />
          </Card>
        ) : null}

        <View style={styles.quickGrid}>
          <QuickActionCard
            title="Browse"
            subtitle="All auctions"
            value="Live"
            onPress={() => router.push("/auctions")}
          />

          <QuickActionCard
            title="Create"
            subtitle="Sell an item"
            value="+"
            onPress={() => router.push("/auctions/create")}
          />

          <QuickActionCard
            title="Watchlist"
            subtitle="Saved items"
            value="★"
            onPress={() => router.push("/me/watchlist")}
          />

          <QuickActionCard
            title="My Bids"
            subtitle="Bid history"
            value="$"
            onPress={() => router.push("/me/bids")}
          />
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>Auction Summary</Text>
              <Text style={styles.summarySubtitle}>
                Your marketplace activity
              </Text>
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role || "user"}</Text>
            </View>
          </View>

          <View style={styles.summaryActions}>
            <AppButton
              title="Profile"
              onPress={() => router.push("/me/profile")}
              variant="secondary"
              style={styles.summaryButton}
            />

            <AppButton
              title="My Auctions"
              onPress={() => router.push("/me/auctions")}
              variant="secondary"
              style={styles.summaryButton}
            />

            {user?.role === "admin" ? (
              <AppButton
                title="Admin"
                onPress={() => router.push("/admin")}
                style={styles.summaryButton}
              />
            ) : null}
          </View>
        </Card>

        <SectionHeader
          title="Latest Auctions"
          actionLabel="View All"
          onActionPress={() => router.push("/auctions")}
        />

        {latestAuctions.length === 0 ? (
          <EmptyState
            title="No live auctions yet"
            message="Create your first auction or check again later."
            actionTitle="Create Auction"
            onActionPress={() => router.push("/auctions/create")}
            style={styles.emptyState}
          />
        ) : (
          latestAuctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              onPress={() => goToAuctionDetail(auction.id)}
            />
          ))
        )}

        <SectionHeader
          title="Ending Soon"
          actionLabel="See More"
          onActionPress={() =>
            router.push({
              pathname: "/auctions",
              params: {
                ending_soon: "true",
              },
            })
          }
        />

        {endingSoonAuctions.length === 0 ? (
          <Card style={styles.smallEmptyCard}>
            <Text style={styles.smallEmptyTitle}>Nothing ending soon</Text>
            <Text style={styles.smallEmptyMessage}>
              Auctions ending within 24 hours will appear here.
            </Text>
          </Card>
        ) : (
          endingSoonAuctions.map((auction) => (
            <AuctionCard
              key={`ending-${auction.id}`}
              auction={auction}
              onPress={() => goToAuctionDetail(auction.id)}
            />
          ))
        )}

        <View style={styles.footerActions}>
          <AppButton
            title="Refresh"
            onPress={handleRefresh}
            variant="secondary"
            style={styles.footerButton}
          />

          <AppButton
            title="Logout"
            onPress={() => {
              Alert.alert("Logout", "Do you want to logout?", [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: handleLogout,
                },
              ]);
            }}
            variant="danger"
            style={styles.footerButton}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },

  header: {
    marginBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: darkColors.border,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    color: darkColors.primary,
    fontSize: typography.heading,
    fontWeight: "900",
  },

  eyebrow: {
    color: darkColors.primary,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    color: darkColors.text,
    fontSize: typography.title,
    fontWeight: "900",
  },
  subtitle: {
    color: darkColors.muted,
    fontSize: typography.body,
    lineHeight: spacing.xl,
    marginTop: spacing.md,
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
  errorButton: {
    marginTop: spacing.lg,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  summaryCard: {
    marginBottom: spacing.xl,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  summaryTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  summarySubtitle: {
    color: darkColors.muted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  summaryActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  summaryButton: {
    flex: 1,
  },

  roleBadge: {
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  roleText: {
    color: darkColors.primary,
    fontSize: typography.small,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  emptyState: {
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 22,
    marginBottom: spacing.xl,
  },

  smallEmptyCard: {
    marginBottom: spacing.xl,
  },
  smallEmptyTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  smallEmptyMessage: {
    color: darkColors.muted,
    fontSize: typography.caption,
    lineHeight: 20,
    marginTop: spacing.xs,
  },

  footerActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
