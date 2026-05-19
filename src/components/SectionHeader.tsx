import { StyleSheet, Text, View } from "react-native";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {actionLabel && onActionPress ? (
        <Text style={styles.sectionLink} onPress={onActionPress}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: darkColors.text,
    fontSize: typography.heading,
    fontWeight: "900",
  },
  sectionLink: {
    color: darkColors.primary,
    fontSize: typography.caption,
    fontWeight: "900",
  },
});
