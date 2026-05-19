import { StyleSheet, Text, View } from "react-native";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

type InfoLineProps = {
  label: string;
  value: string;
};

export function InfoLine({ label, value }: InfoLineProps) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLineLabel}>{label}</Text>
      <Text style={styles.infoLineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: darkColors.border,
  },
  infoLineLabel: {
    color: darkColors.muted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  infoLineValue: {
    color: darkColors.text,
    fontSize: typography.caption,
    fontWeight: "900",
    flex: 1,
    textAlign: "right",
  },
});
