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
import type { WatchlistItem } from "../types/auction";
import { removeAuthTokens } from "../utils/auth";

export default function WatchlistScreen() {
  const router = useRouter();

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [removingID, setRemovingID] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadWatchlist = useCallback(
    async (silent = false) => {
      try {
        setErrorMessage("");

        if (!silent) {
          setLoading(true);
        }

        const data = await auctionApi.getMyWatchlist();
        setWatchlist(data);
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          await removeAuthTokens();
          router.replace("/login");
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Không thể tải watchlist của bạn."),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void loadWatchlist();
  }, [loadWatchlist]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadWatchlist(true);
  };

  const handleUnwatch = async (item: WatchlistItem) => {
    Alert.alert(
      "Remove from Watchlist",
      "Do you want to remove this auction from your watchlist?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingID(item.auction_id);

            try {
              await auctionApi.unwatchAuction(item.auction_id);

              setWatchlist((prev) =>
                prev.filter(
                  (watchItem) => watchItem.auction_id !== item.auction_id,
                ),
              );
            } catch (error: unknown) {
              Alert.alert("Unwatch failed", getApiErrorMessage(error));
            } finally {
              setRemovingID(null);
            }
          },
        },
      ],
    );
  };

  const renderWatchlistItem = ({ item }: { item: WatchlistItem }) => {
    const auction = item.auction;

    if (!auction) {
      return null;
    }

    return (
      <View style={styles.watchItem}>
        <AuctionCard
          auction={auction}
          onPress={() => router.push(`/auctions/${item.auction_id}`)}
        />

        <Card style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <View style={styles.actionTextBox}>
              <Text style={styles.actionTitle}>Watching</Text>
              <Text style={styles.actionSubtitle}>
                This auction is saved in your watchlist.
              </Text>
            </View>

            <Text style={styles.star}>★</Text>
          </View>

          <View style={styles.actionRow}>
            <AppButton
              title="Open"
              onPress={() => router.push(`/auctions/${item.auction_id}`)}
              variant="secondary"
              style={styles.actionButton}
            />

            <AppButton
              title="Unwatch"
              onPress={() => handleUnwatch(item)}
              variant="danger"
              loading={removingID === item.auction_id}
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
        <LoadingState message="Đang tải watchlist..." />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screenContent}>
      <FlatList
        data={watchlist}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderWatchlistItem}
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
              <Text style={styles.eyebrow}>Saved Auctions</Text>
              <Text style={styles.title}>Watchlist</Text>
              <Text style={styles.subtitle}>
                Track auctions you care about and return before they end.
              </Text>
            </View>

            <Card style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{watchlist.length}</Text>
              <Text style={styles.summaryLabel}>Saved auctions</Text>
            </Card>

            {errorMessage ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorTitle}>Unable to load watchlist</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>

                <AppButton
                  title="Try Again"
                  onPress={() => loadWatchlist()}
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
              title="Your watchlist is empty"
              message="Open an auction and press Watch to save it here."
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

  watchItem: {
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
  star: {
    color: darkColors.primary,
    fontSize: typography.heading,
    fontWeight: "900",
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
