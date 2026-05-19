import { useLocalSearchParams, useRouter } from "expo-router";
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

import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";

import { auctionApi } from "../api/auctionApi";
import { authApi } from "../api/authApi";
import { getApiErrorMessage, isUnauthorizedError } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { BidHistoryItem } from "../components/BidHistoryItem";
import { Card } from "../components/Card";
import { CountdownText } from "../components/CountdownText";
import { InfoBox } from "../components/InfoBox";
import { InfoLine } from "../components/InfoLine";
import { PriceText } from "../components/PriceText";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type { Auction, Bid, WatchlistItem } from "../types/auction";
import { User } from "../types/auth";
import { removeAuthTokens } from "../utils/auth";
import {
  formatAuctionStatus,
  formatCondition,
  formatCurrency,
  formatDateTime,
} from "../utils/format";

export default function AuctionDetailScreen() {
  const router = useRouter();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { id } = useLocalSearchParams<{ id: string }>();
  const auctionID = Number(id);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isWatched, setIsWatched] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [watchLoading, setWatchLoading] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const product = auction?.product;
  const images = product?.images || [];
  const selectedImage = images[selectedImageIndex];

  const [bidAmount, setBidAmount] = useState("");
  const isAuctionOpen = auction?.status === "live";
  const isSeller = Boolean(
    auction && currentUser && auction.seller_id === currentUser.id,
  );
  const [placingBid, setPlacingBid] = useState(false);

  const loadDetail = useCallback(
    async (silent = false) => {
      if (!auctionID || Number.isNaN(auctionID)) {
        setErrorMessage("Invalid auction id.");
        setLoading(false);
        return;
      }

      try {
        setErrorMessage("");

        if (!silent) {
          setLoading(true);
        }

        const [auctionData, bidData, userData, watchlistData] =
          await Promise.all([
            auctionApi.getAuctionById(auctionID),
            auctionApi.getAuctionBids(auctionID),
            authApi.me(),
            auctionApi.getMyWatchlist(),
          ]);

        setAuction(auctionData);
        setBids(bidData);
        setCurrentUser(userData);

        const watched = watchlistData.some(
          (item: WatchlistItem) => item.auction_id === auctionID,
        );

        setIsWatched(watched);
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          await removeAuthTokens();
          router.replace("/login");
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, "Không thể tải chi tiết auction."),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [auctionID, router],
  );

  const handleToggleWatch = async () => {
    if (!auction) return;

    setWatchLoading(true);

    try {
      if (isWatched) {
        await auctionApi.unwatchAuction(auction.id);
        setIsWatched(false);
      } else {
        await auctionApi.watchAuction(auction.id);
        setIsWatched(true);
      }
    } catch (error: unknown) {
      Alert.alert("Watchlist error", getApiErrorMessage(error));
    } finally {
      setWatchLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadDetail(true);
  };

  const minimumBid = useMemo(() => {
    if (!auction) return 0;

    if (bids.length === 0) {
      return auction.start_price;
    }

    return auction.current_price + auction.bid_increment;
  }, [auction, bids.length]);

  const canPlaceBid = useMemo(() => {
    const amount = Number(bidAmount);

    return (
      Boolean(auction) &&
      isAuctionOpen &&
      !isSeller &&
      !Number.isNaN(amount) &&
      amount >= minimumBid &&
      !placingBid
    );
  }, [auction, isAuctionOpen, isSeller, bidAmount, minimumBid, placingBid]);

  const handlePlaceBid = async () => {
    if (!auction) return;

    const amount = Number(bidAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid bid", "Please enter a valid bid amount.");
      return;
    }

    if (amount < minimumBid) {
      Alert.alert(
        "Bid too low",
        `Your bid must be at least ${formatCurrency(minimumBid)}.`,
      );
      return;
    }

    setPlacingBid(true);

    try {
      const result = await auctionApi.placeBid(auction.id, {
        amount,
      });

      setBidAmount("");
      setAuction(result.auction);

      const updatedBids = await auctionApi.getAuctionBids(auction.id);
      setBids(updatedBids);

      Alert.alert("Success", "Bid placed successfully.");
    } catch (error: unknown) {
      Alert.alert("Bid failed", getApiErrorMessage(error));
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Đang tải chi tiết auction..." />
      </Screen>
    );
  }

  if (errorMessage || !auction) {
    return (
      <Screen>
        <View style={styles.errorWrapper}>
          <EmptyState
            title="Auction unavailable"
            message={errorMessage || "This auction could not be found."}
            actionTitle="Back to Auctions"
            onActionPress={() => router.replace("/auctions")}
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

          <Pressable
            onPress={handleToggleWatch}
            disabled={watchLoading}
            style={[styles.watchButton, isWatched && styles.watchButtonActive]}>
            <Text
              style={[styles.watchText, isWatched && styles.watchTextActive]}>
              {isWatched ? "★ Watched" : "☆ Watch"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.imageBox}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.mainImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {formatAuctionStatus(auction.status)}
            </Text>
          </View>
        </View>

        {images.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}>
            {images.map((imageUrl, index) => (
              <Pressable
                key={`${imageUrl}-${index}`}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailActive,
                ]}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.thumbnailImage}
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.titleSection}>
          <Text style={styles.categoryText}>
            {product?.category?.name || "Uncategorized"} •{" "}
            {formatCondition(product?.condition)}
          </Text>

          <Text style={styles.title}>
            {product?.title || "Untitled auction"}
          </Text>

          <Text style={styles.description}>
            {product?.description || "No description provided."}
          </Text>
        </View>

        <Card style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <View>
              <Text style={styles.smallLabel}>Current Bid</Text>
              <PriceText value={auction.current_price} size="lg" />
            </View>

            <View style={styles.countdownBox}>
              <Text style={styles.smallLabel}>Ends In</Text>
              <CountdownText
                endsAt={auction.ends_at}
                status={auction.status}
                style={styles.countdown}
              />
            </View>
          </View>

          <View style={styles.priceGrid}>
            <InfoBox
              label="Start"
              value={formatCurrency(auction.start_price)}
            />

            <InfoBox
              label="Increment"
              value={formatCurrency(auction.bid_increment)}
            />

            <InfoBox
              label="Buy Now"
              value={
                auction.buy_now_price
                  ? formatCurrency(auction.buy_now_price)
                  : "N/A"
              }
            />

            <InfoBox label="Minimum Bid" value={formatCurrency(minimumBid)} />
          </View>
        </Card>

        <Card style={styles.sellerCard}>
          <Text style={styles.cardTitle}>Seller</Text>

          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              {auction.seller?.avatar_url ? (
                <Image
                  style={styles.sellerAvatarImage}
                  source={{ uri: auction.seller.avatar_url }}
                />
              ) : (
                <Text style={styles.sellerAvatarText}>
                  {(auction.seller?.name || "S").charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>
                {auction.seller?.name || "Unknown seller"}
              </Text>
              <Text style={styles.sellerEmail}>
                {auction.seller?.email || "No email"}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.bidCard}>
          <Text style={styles.cardTitle}>Place Bid</Text>

          {isSeller ? (
            <Text style={styles.warningText}>
              You are the seller of this auction. Sellers cannot bid on their
              own auctions.
            </Text>
          ) : !isAuctionOpen ? (
            <Text style={styles.warningText}>
              This auction is not open for bidding.
            </Text>
          ) : (
            <>
              <AppInput
                label={`Your Bid - minimum ${formatCurrency(minimumBid)}`}
                placeholder="Enter bid amount"
                keyboardType="numeric"
                value={bidAmount}
                onChangeText={setBidAmount}
              />

              <AppButton
                title="Place Bid"
                onPress={handlePlaceBid}
                loading={placingBid}
                disabled={!canPlaceBid}
              />
            </>
          )}
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bid History</Text>
          <Text style={styles.sectionMeta}>{bids.length} bids</Text>
        </View>

        <Card style={styles.timelineCard}>
          <Text style={styles.cardTitle}>Timeline</Text>

          <InfoLine
            label="Starts At"
            value={formatDateTime(auction.starts_at)}
          />
          <InfoLine label="Ends At" value={formatDateTime(auction.ends_at)} />
          <InfoLine
            label="Status"
            value={formatAuctionStatus(auction.status)}
          />

          {auction.winner ? (
            <InfoLine label="Winner" value={auction.winner.name} />
          ) : null}
        </Card>

        {bids.length === 0 ? (
          <Card>
            <Text style={styles.noBidTitle}>No bids yet</Text>
            <Text style={styles.noBidMessage}>
              Be the first bidder if this auction is live.
            </Text>
          </Card>
        ) : (
          bids.map((bid, index) => (
            <BidHistoryItem key={bid.id} bid={bid} isHighest={index === 0} />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  timelineCard: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  sectionMeta: {
    color: darkColors.muted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  noBidTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  noBidMessage: {
    color: darkColors.muted,
    fontSize: typography.caption,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  bidCard: {
    marginBottom: spacing.lg,
  },
  warningText: {
    color: darkColors.warning,
    fontSize: typography.body,
    lineHeight: 23,
    fontWeight: "700",
  },
  sellerCard: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
    marginBottom: spacing.md,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    marginRight: spacing.md,
    overflow: "hidden",
  },
  sellerAvatarImage: { width: "100%", height: "100%" },
  sellerAvatarText: {
    color: darkColors.primary,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  sellerEmail: {
    color: darkColors.muted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  priceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  priceCard: {
    marginBottom: spacing.lg,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  countdownBox: {
    alignItems: "flex-end",
  },
  countdown: {
    fontSize: typography.body,
  },
  smallLabel: {
    color: darkColors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  titleSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  categoryText: {
    color: darkColors.primary,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    color: darkColors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  description: {
    color: darkColors.muted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.md,
  },

  thumbnailRow: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surface,
  },
  thumbnailActive: {
    borderColor: darkColors.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  imageBox: {
    height: 320,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: darkColors.border,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.surfaceSoft,
  },
  placeholderText: {
    color: darkColors.muted,
    fontSize: typography.body,
    fontWeight: "800",
  },
  statusBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    backgroundColor: darkColors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    color: darkColors.textInverse,
    fontSize: typography.small,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
  },
  backText: {
    color: darkColors.primary,
    fontSize: typography.body,
    fontWeight: "900",
  },
  watchButton: {
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  watchButtonActive: {
    borderColor: darkColors.primary,
    backgroundColor: "#14100A",
  },
  watchText: {
    color: darkColors.textSoft,
    fontSize: typography.caption,
    fontWeight: "900",
  },
  watchTextActive: {
    color: darkColors.primary,
  },
  errorWrapper: {
    flex: 1,
    justifyContent: "center",
  },
});
