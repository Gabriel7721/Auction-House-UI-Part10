import { Pressable, StyleSheet, Text, View } from "react-native";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { formatDateOnly, formatTimeOnly } from "../utils/format";

type DateTimeSelectorProps = {
  label: string;
  value: Date;
  error?: string;
  onPickDate: () => void;
  onPickTime: () => void;
};

export function DateTimeSelector({
  label,
  value,
  error,
  onPickDate,
  onPickTime,
}: DateTimeSelectorProps) {
  return (
    <View style={styles.dateTimeBlock}>
      <Text style={styles.label}>{label}</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.dateTimeRow}>
        <Pressable onPress={onPickDate} style={styles.dateTimeButton}>
          <Text style={styles.dateTimeLabel}>Date</Text>
          <Text style={styles.dateTimeValue}>{formatDateOnly(value)}</Text>
        </Pressable>

        <Pressable onPress={onPickTime} style={styles.dateTimeButton}>
          <Text style={styles.dateTimeLabel}>Time</Text>
          <Text style={styles.dateTimeValue}>{formatTimeOnly(value)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateTimeBlock: {
    marginBottom: spacing.lg,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dateTimeButton: {
    flex: 1,
    minHeight: 74,
    backgroundColor: darkColors.surfaceSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: "center",
  },
  dateTimeLabel: {
    color: darkColors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  dateTimeValue: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },

  label: {
    color: darkColors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  errorText: {
    color: darkColors.danger,
    fontSize: typography.caption,
    marginBottom: spacing.sm,
  },
});
