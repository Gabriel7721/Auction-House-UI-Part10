import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type { Auction } from "../types/auction";
import { formatAuctionStatus, formatCondition } from "../utils/format";
import { CountdownText } from "./CountdownText";
import { PriceText } from "./PriceText";

type AuctionCardProps = {
  auction: Auction;
  onPress?: () => void;
  style?: ViewStyle;
};

export function AuctionCard({ auction, onPress, style }: AuctionCardProps) {
  const product = auction.product;
  const imageUrl = product?.images?.[0];

  const statusColor = getStatusColor(auction.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      <View style={styles.imageWrapper}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {formatAuctionStatus(auction.status)}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.title}>
          {product?.title || "Untitled auction"}
        </Text>

        <Text numberOfLines={2} style={styles.description}>
          {product?.description || "No description"}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{formatCondition(product?.condition)}</Text>

          {product?.category?.name ? (
            <Text style={styles.meta}>{product.category.name}</Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.smallLabel}>Current Bid</Text>
            <PriceText value={auction.current_price} size="lg" />
          </View>

          <View style={styles.timeBox}>
            <Text style={styles.smallLabel}>Ends In</Text>
            <CountdownText endsAt={auction.ends_at} status={auction.status} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function getStatusColor(status: Auction["status"]): string {
  switch (status) {
    case "live":
      return darkColors.success;
    case "scheduled":
      return darkColors.info;
    case "ended":
      return darkColors.borderSoft;
    case "cancelled":
      return darkColors.danger;
    default:
      return darkColors.borderSoft;
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkColors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: darkColors.border,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  imageWrapper: {
    height: 180,
    backgroundColor: darkColors.surfaceSoft,
    position: "relative",
  },
  image: {
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
    fontSize: typography.caption,
    fontWeight: "700",
  },
  statusBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    color: darkColors.white,
    fontSize: typography.small,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
  },
  description: {
    color: darkColors.muted,
    fontSize: typography.caption,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  meta: {
    color: darkColors.textSoft,
    fontSize: typography.small,
    fontWeight: "700",
    backgroundColor: darkColors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    overflow: "hidden",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: darkColors.border,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  smallLabel: {
    color: darkColors.muted,
    fontSize: typography.small,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  timeBox: {
    alignItems: "flex-end",
  },
});
