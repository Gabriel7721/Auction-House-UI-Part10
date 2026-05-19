import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { authApi } from "@/src/api/authApi";
import { isUnauthorizedError } from "@/src/api/client";
import { LoadingState } from "@/src/components/LoadingState";
import { Screen } from "../src/components/Screen";
import { getAccessToken, removeAuthTokens } from "../src/utils/auth";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<"/home" | "/login">("/login");

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const token = await getAccessToken();

        if (!token) {
          if (mounted) setRedirectTo("/login");
          return;
        }

        await authApi.me();
        if (mounted) setRedirectTo("/home");
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await removeAuthTokens();
        }

        if (mounted) setRedirectTo("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Screen>
        <LoadingState message="Đang kiểm tra phiên đăng nhập..." />
      </Screen>
    );
  }

  return <Redirect href={redirectTo} />;
}
