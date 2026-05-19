import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
import { typography } from "../constants/typography";

interface Props {
  children: ReactNode;
  style: StyleProp<TextStyle>;
}

export default function AppText({ children, style }: Props) {
  return <Text style={[styles.text, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: typography.body,
  },
});
