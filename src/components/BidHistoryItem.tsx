import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import type { Bid } from "../types/auction";
import { formatCurrency, formatDateTime } from "../utils/format";

type BidHistoryItemProps = {
  bid: Bid;
  isHighest?: boolean;
};

export function BidHistoryItem({
  bid,
  isHighest = false,
}: BidHistoryItemProps) {
  return (
    <View style={[styles.container, isHighest && styles.highest]}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          {bid.user?.avatar_url ? (
            <Image
              source={{ uri: bid.user.avatar_url }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.avatarText}>
              {(bid.user?.name || "U").charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{bid.user?.name || "Unknown bidder"}</Text>
          <Text style={styles.date}>{formatDateTime(bid.created_at)}</Text>
        </View>
      </View>

      <View style={styles.right}>
        {isHighest ? <Text style={styles.highestLabel}>Highest</Text> : null}
        <Text style={styles.amount}>{formatCurrency(bid.amount)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkColors.surface,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  highest: {
    borderColor: darkColors.primary,
    backgroundColor: "#14100A",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    marginRight: spacing.md,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: darkColors.primary,
    fontSize: typography.body,
    fontWeight: "900",
  },
  info: {
    flex: 1,
  },
  name: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  date: {
    color: darkColors.muted,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
  right: {
    alignItems: "flex-end",
    marginLeft: spacing.md,
  },
  highestLabel: {
    color: darkColors.primary,
    fontSize: typography.small,
    fontWeight: "900",
    marginBottom: spacing.xs,
  },
  amount: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
});
