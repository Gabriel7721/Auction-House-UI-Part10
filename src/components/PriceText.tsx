import React from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";

import { darkColors } from "../constants/darkColors";
import { typography } from "../constants/typography";
import { formatCurrency } from "../utils/format";

type PriceTextProps = {
  value?: number | null;
  label?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  style?: TextStyle;
};

export function PriceText({
  value,
  label,
  size = "md",
  color = darkColors.primary,
  style,
}: PriceTextProps) {
  return (
    <Text style={[styles.base, styles[size], { color }, style]}>
      {label ? `${label}: ` : ""}
      {formatCurrency(value)}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontWeight: "900",
  },
  sm: {
    fontSize: typography.caption,
  },
  md: {
    fontSize: typography.body,
  },
  lg: {
    fontSize: typography.heading,
  },
});
