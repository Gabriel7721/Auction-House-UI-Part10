import { StyleSheet, Text } from "react-native";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { AppButton } from "./AppButton";
import { Card } from "./Card";

type QuickActionCardProps = {
  title: string;
  subtitle: string;
  value: string;
  onPress: () => void;
};

export function QuickActionCard({
  title,
  subtitle,
  value,
  onPress,
}: QuickActionCardProps) {
  return (
    <Card style={styles.quickCard}>
      <Text style={styles.quickValue}>{value}</Text>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>

      <AppButton
        title="Open"
        onPress={onPress}
        variant="ghost"
        style={styles.quickButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  quickCard: {
    width: "47.8%",
    padding: spacing.md,
  },
  quickValue: {
    color: darkColors.primary,
    fontSize: typography.heading,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  quickTitle: {
    color: darkColors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  quickSubtitle: {
    color: darkColors.muted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  quickButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    minHeight: 36,
    paddingHorizontal: 0,
  },
});
