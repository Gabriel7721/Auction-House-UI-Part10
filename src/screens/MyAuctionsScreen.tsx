import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { auctionApi } from "../api/auctionApi";
import { getApiErrorMessage, isUnauthorizedError } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AuctionCard } from "../components/AuctionCard";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";

import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type { Auction } from "../types/auction";
import { removeAuthTokens } from "../utils/auth";

export default function MyAuctionsScreen() {
  const router = useRouter();

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [cancellingID, setCancellingID] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMyAuctions = useCallback(
    async (silent = false) => {
      try {
        setErrorMessage("");

        if (!silent) {
          setLoading(true);
        }

        const data = await auctionApi.getMyAuctions();
        setAuctions(data);
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          await removeAuthTokens();
          router.replace("/login");
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Không thể tải danh sách auction của bạn."),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void loadMyAuctions();
  }, [loadMyAuctions]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadMyAuctions(true);
  };

  const handleCancelAuction = (auction: Auction) => {
    if (auction.status === "ended") {
      Alert.alert("Cannot cancel", "Ended auction cannot be cancelled.");
      return;
    }

    if (auction.status === "cancelled") {
      Alert.alert("Already cancelled", "This auction is already cancelled.");
      return;
    }

    Alert.alert(
      "Cancel Auction",
      "Are you sure you want to cancel this auction?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Cancel Auction",
          style: "destructive",
          onPress: async () => {
            setCancellingID(auction.id);

            try {
              await auctionApi.cancelAuction(auction.id);
              await loadMyAuctions(true);
              Alert.alert("Success", "Auction cancelled successfully.");
            } catch (error: unknown) {
              Alert.alert("Cancel failed", getApiErrorMessage(error));
            } finally {
              setCancellingID(null);
            }
          },
        },
      ],
    );
  };

  const renderAuction = ({ item }: { item: Auction }) => {
    const canCancel = item.status !== "ended" && item.status !== "cancelled";

    return (
      <View style={styles.auctionItem}>
        <AuctionCard
          auction={item}
          onPress={() => router.push(`/auctions/${item.id}`)}
        />

        <Card style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <View style={styles.actionTextBox}>
              <Text style={styles.actionTitle}>Seller Controls</Text>
              <Text style={styles.actionSubtitle}>
                Manage this auction listing.
              </Text>
            </View>

            <Text style={styles.statusText}>{item.status}</Text>
          </View>

          <View style={styles.actionRow}>
            <AppButton
              title="View"
              onPress={() => router.push(`/auctions/${item.id}`)}
              variant="secondary"
              style={styles.actionButton}
            />

            <AppButton
              title="Cancel"
              onPress={() => handleCancelAuction(item)}
              variant="danger"
              disabled={!canCancel}
              loading={cancellingID === item.id}
              style={styles.actionButton}
            />
          </View>
        </Card>
      </View>
    );
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Đang tải auction của bạn..." />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screenContent}>
      <FlatList
        data={auctions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAuction}
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
              <Text style={styles.eyebrow}>Seller Dashboard</Text>
              <Text style={styles.title}>My Auctions</Text>
              <Text style={styles.subtitle}>
                View and manage the auction listings you created.
              </Text>
            </View>

            <Card style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{auctions.length}</Text>
              <Text style={styles.summaryLabel}>Total auctions created</Text>
            </Card>

            {errorMessage ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorTitle}>Unable to load auctions</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>

                <AppButton
                  title="Try Again"
                  onPress={() => loadMyAuctions()}
                  variant="secondary"
                  style={styles.errorButton}
                />
              </Card>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !errorMessage ? (
            <EmptyState
              title="No auctions yet"
              message="Create your first auction and it will appear here."
              actionTitle="Create Auction"
              onActionPress={() => router.push("/auctions/create")}
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

  summaryCard: {
    marginBottom: spacing.xl,
  },
  summaryNumber: {
    color: darkColors.primary,
    fontSize: 34,
    fontWeight: "900",
  },
  summaryLabel: {
    color: darkColors.muted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
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

  auctionItem: {
    marginBottom: spacing.xl,
  },
  actionCard: {
    marginTop: -spacing.sm,
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  actionSubtitle: {
    color: darkColors.muted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  statusText: {
    color: darkColors.primary,
    fontSize: typography.small,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
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
});
