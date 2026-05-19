import { StyleSheet, Text, View } from "react-native";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

type InfoBoxProps = {
  label: string;
  value: string;
};

export function InfoBox({ label, value }: InfoBoxProps) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoBoxLabel}>{label}</Text>
      <Text style={styles.infoBoxValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    width: "47.5%",
    backgroundColor: darkColors.surfaceSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkColors.border,
    padding: spacing.md,
  },
  infoBoxLabel: {
    color: darkColors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  infoBoxValue: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
});
