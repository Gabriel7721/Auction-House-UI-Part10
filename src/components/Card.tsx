import React from "react";
import { StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: darkColors.border,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
});
