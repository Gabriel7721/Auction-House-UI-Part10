import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { authApi } from "../api/authApi";
import { getApiErrorMessage } from "../api/client";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { darkColors } from "../constants/darkColors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { saveAuthTokens } from "../utils/auth";
import { syncPushTokenWithBackend } from "../utils/pushNotifications";
import { isValidEmail, validatePassword } from "../utils/validators";

type LoginErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0 && !loading;
  }, [email, password, loading]);

  const validate = () => {
    const nextErrors: LoginErrors = {};

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

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });
      const accessToken = response.access_token || response.token;

      if (!accessToken) {
        throw new Error("Server không trả về access token.");
      }

      await saveAuthTokens(accessToken, response.refresh_token);

      try {
        await syncPushTokenWithBackend();
      } catch (pushError) {
        console.log("Push token registration skipped", pushError);
      }

      router.replace("/home");
      
    } catch (error: unknown) {
      Alert.alert("Đăng nhập thất bại", getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>Logo</Text>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>This is subtitle.</Text>
      </View>

      <Card>
        <AppInput
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />

        <AppInput
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <AppButton
          title="Đăng nhập"
          onPress={handleLogin}
          loading={loading}
          disabled={!canSubmit}
        />

        <AppButton
          title="Quên mật khẩu?"
          onPress={() =>
            Alert.alert(
              "Comming soon!",
              "This function have not been completed yet.",
            )
          }
          variant="ghost"
          style={styles.ghostButton}
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Chưa có tài khoản?</Text>
        <AppButton
          title="Tạo tài khoản mới"
          onPress={() => router.push("/register")}
          variant="ghost"
        />
      </View>
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
  ghostButton: {
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
