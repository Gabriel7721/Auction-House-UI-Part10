import React, { useEffect, useState } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";

import { darkColors } from "../constants/darkColors";
import { typography } from "../constants/typography";
import { formatCountdown, getTimeRemaining } from "../utils/format";

type CountdownTextProps = {
  endsAt: string;
  status?: string;
  style?: TextStyle;
};

export function CountdownText({ endsAt, status, style }: CountdownTextProps) {
  const [label, setLabel] = useState(() => formatCountdown(endsAt));

  useEffect(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setLabel(formatCountdown(endsAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  const remaining = getTimeRemaining(endsAt);
  const isEnded = status === "ended" || remaining.total <= 0;
  const isWarning = remaining.total > 0 && remaining.total <= 1000 * 60 * 60;

  return (
    <Text
      style={[
        styles.text,
        isEnded && styles.ended,
        isWarning && styles.warning,
        style,
      ]}>
      {isEnded ? "Ended" : label}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: darkColors.info,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  warning: {
    color: darkColors.warning,
  },
  ended: {
    color: darkColors.muted,
  },
});
