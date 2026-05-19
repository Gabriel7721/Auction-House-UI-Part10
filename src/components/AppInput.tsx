import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
};

export function AppInput({ label, error, style, ...props }: AppInputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={darkColors.muted}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    color: darkColors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: darkColors.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: darkColors.danger,
  },
  error: {
    color: darkColors.danger,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
