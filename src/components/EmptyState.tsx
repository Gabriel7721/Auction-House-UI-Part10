import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { AppButton } from "./AppButton";

type EmptyStateProps = {
  title: string;
  message?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
};

export function EmptyState({
  title,
  message,
  actionTitle,
  onActionPress,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>⌁</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {actionTitle && onActionPress ? (
        <AppButton
          title={actionTitle}
          onPress={onActionPress}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.surfaceSoft,
    borderWidth: 1,
    borderColor: darkColors.border,
    marginBottom: spacing.lg,
  },
  icon: {
    color: darkColors.primary,
    fontSize: 34,
    fontWeight: "900",
  },
  title: {
    color: darkColors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
    textAlign: "center",
  },
  message: {
    color: darkColors.muted,
    fontSize: typography.body,
    lineHeight: 23,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
  },
});
