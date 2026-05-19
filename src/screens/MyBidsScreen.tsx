import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { auctionApi } from "../api/auctionApi";
import { getApiErrorMessage, isUnauthorizedError } from "../api/client";
import { AppButton } from "../components/AppButton";
import { BidHistoryItem } from "../components/BidHistoryItem";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { PriceText } from "../components/PriceText";
import { Screen } from "../components/Screen";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type { Bid } from "../types/auction";
import { formatAuctionStatus, formatDateTime } from "../utils/format";
import { removeAuthTokens } from "../utils/auth";

export default function MyBidsScreen() {
  const router = useRouter();

  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const totalBidAmount = useMemo(() => {
    return bids.reduce((sum, bid) => sum + bid.amount, 0);
  }, [bids]);

  const loadMyBids = useCallback(
    async (silent = false) => {
      try {
        setErrorMessage("");

        if (!silent) {
          setLoading(true);
        }

        const data = await auctionApi.getMyBids();
        setBids(data);
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          await removeAuthTokens();
          router.replace("/login");
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Không thể tải lịch sử bid của bạn."),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void loadMyBids();
  }, [loadMyBids]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadMyBids(true);
  };

  const renderBid = ({ item }: { item: Bid }) => {
    const auction = item.auction;
    const product = auction?.product;

    return (
      <Pressable
        onPress={() => {
          if (item.auction_id) {
            router.push(`/auctions/${item.auction_id}`);
          }
        }}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <Card style={styles.bidCard}>
          <View style={styles.bidHeader}>
            <View style={styles.bidTitleBox}>
              <Text numberOfLines={1} style={styles.auctionTitle}>
                {product?.title || `Auction #${item.auction_id}`}
              </Text>

              <Text style={styles.bidDate}>
                Bid placed: {formatDateTime(item.created_at)}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {formatAuctionStatus(auction?.status)}
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.smallLabel}>Your Bid</Text>
              <PriceText value={item.amount} size="lg" />
            </View>

            <View style={styles.currentPriceBox}>
              <Text style={styles.smallLabel}>Current</Text>
              <PriceText
                value={auction?.current_price}
                size="md"
                color={darkColors.text}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <BidHistoryItem bid={item} />

          <Text style={styles.openHint}>Tap to open auction detail</Text>
        </Card>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Đang tải lịch sử bid..." />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screenContent}>
      <FlatList
        data={bids}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderBid}
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
              <Text style={styles.eyebrow}>Bid Activity</Text>
              <Text style={styles.title}>My Bids</Text>
              <Text style={styles.subtitle}>
                Track all bids you placed across active and completed auctions.
              </Text>
            </View>

            <View style={styles.summaryGrid}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{bids.length}</Text>
                <Text style={styles.summaryLabel}>Total bids</Text>
              </Card>

              <Card style={styles.summaryCard}>
                <PriceText value={totalBidAmount} size="lg" />
                <Text style={styles.summaryLabel}>Bid volume</Text>
              </Card>
            </View>

            {errorMessage ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorTitle}>Unable to load bids</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>

                <AppButton
                  title="Try Again"
                  onPress={() => loadMyBids()}
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
              title="No bids yet"
              message="Browse auctions and place your first bid."
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

  summaryGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
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

  pressed: {
    opacity: 0.9,
  },
  bidCard: {
    marginBottom: spacing.lg,
  },
  bidHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  bidTitleBox: {
    flex: 1,
  },
  auctionTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  bidDate: {
    color: darkColors.muted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  statusBadge: {
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    color: darkColors.primary,
    fontSize: typography.small,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  smallLabel: {
    color: darkColors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  currentPriceBox: {
    alignItems: "flex-end",
  },
  divider: {
    height: 1,
    backgroundColor: darkColors.border,
    marginVertical: spacing.md,
  },
  openHint: {
    color: darkColors.muted,
    fontSize: typography.small,
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.sm,
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