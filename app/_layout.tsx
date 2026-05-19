// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="index" />
//       <Stack.Screen name="login" />
//       <Stack.Screen name="register" />
//       <Stack.Screen name="home" />
//     </Stack>
//   );
// }
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type PushNavigationData = {
  screen?: string;
  auction_id?: string | number;
  notification_id?: string | number;
};

export default function RootLayout() {
  const router = useRouter();
  const handledInitialResponse = useRef(false);

  const navigateFromPushData = useCallback(
    (data: Record<string, unknown> | undefined) => {
      const payload = data as PushNavigationData;

      if (
        payload.screen === "auction_detail" &&
        payload.auction_id !== undefined
      ) {
        router.push("/auctions/${payload.auction_id}");
        return;
      }

      if (payload.screen === "notifications") {
        router.push("/me/notifications");
        return;
      }

      router.push("/me/notifications");
    },
    [router],
  );

  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          "Push notification received:",
          notification.request.content,
        );
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        navigateFromPushData(data);
      });

    const handleInitialNotificationResponse = async () => {
      if (handledInitialResponse.current) {
        return;
      }

      const lastResponse =
        await Notifications.getLastNotificationResponseAsync();

      if (!lastResponse) {
        handledInitialResponse.current = true;
        return;
      }

      const data = lastResponse.notification.request.content.data;

      navigateFromPushData(data);
      await Notifications.clearLastNotificationResponseAsync();

      handledInitialResponse.current = true;
    };

    void handleInitialNotificationResponse();

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [navigateFromPushData]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
