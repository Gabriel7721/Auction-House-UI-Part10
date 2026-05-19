import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";

export function LoadingState({
  message = "Now Loading...",
}: {
  message?: string;
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={darkColors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  message: {
    color: darkColors.muted,
    fontSize: 15,
  },
});
