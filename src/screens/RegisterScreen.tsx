import axios from "axios";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { authApi } from "../api/authApi";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import {
  isValidEmail,
  validatePassword,
  validateRequired,
} from "../utils/validators";

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.trim().length > 0 &&
      !loading
    );
  }, [name, email, password, loading]);

  const validate = () => {
    const nextErrors: RegisterErrors = {};

    const nameError = validateRequired(name, "Tên");
    if (nameError) nextErrors.name = nameError;

    if (!email.trim()) {
      nextErrors.email = "Email là bắt buộc.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Email không hợp lệ.";
    }

    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await authApi.register({
        name: name.trim(),
        email: email.trim().toLocaleLowerCase(),
        password,
      });
      Alert.alert("Thành công", "Đăng ký thành công. Hãy đăng nhập.");
      router.replace("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        Alert.alert("Lỗi", error.response?.data?.message || "Đăng ký thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>Auction House</Text>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>
          Vui lòng đăng ký để tham gia đấu giá sản phẩm.
        </Text>
      </View>

      <Card>
        <AppInput
          label="Name"
          placeholder="Please enter your name"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <AppInput
          label="Email"
          placeholder="Please enter your email"
          autoCapitalize="none"
          autoCorrect={true}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />
        <AppInput
          label="Password"
          placeholder="Please enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />
        <AppButton
          title="Register"
          onPress={handleRegister}
          loading={loading}
          disabled={!canSubmit}
        />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <AppButton
            title="Login"
            onPress={() => router.push("/login")}
            variant="ghost"
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
  },
  header: {
    marginBottom: spacing.xl,
  },
  logo: {
    color: darkColors.primary,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: spacing.md,
  },
  title: {
    color: darkColors.text,
    fontSize: typography.title,
    fontWeight: "900",
  },
  subtitle: {
    color: darkColors.muted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  footerText: {
    color: darkColors.muted,
    fontSize: 15,
  },
});
