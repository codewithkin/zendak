import { useEffect } from "react";

import { DeliveryTruck02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { router } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useMe } from "@/src/hooks/use-auth";
import { apiClient } from "@/src/lib/api";

export default function LoadingScreen() {
  const insets = useSafeAreaInsets();
  const foregroundColor = useThemeColor("foreground");

  const { data: user, isLoading, error } = useMe();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await apiClient.isAuthenticated();

      // No token → redirect to sign-in
      if (!isAuth) {
        router.replace("/sign-in");
        return;
      }

      // Still loading → wait
      if (isLoading) {
        return;
      }

      // Error or user not found → redirect to sign-in
      if (error || !user) {
        await apiClient.clearToken();
        router.replace("/sign-in");
        return;
      }

      // User not onboarded → redirect to onboarding
      if (!user.onboardedAt) {
        router.replace("/onboarding");
        return;
      }

      // User onboarded → redirect to dashboard
      router.replace("/(drawer)");
    };

    checkAuth();
  }, [user, isLoading, error]);

  const statusText = !user && isLoading
    ? "Preparing your mobile logistics workspace."
    : error
      ? "Session expired. Securing access again."
      : user && !user.onboardedAt
        ? "Completing workspace setup."
        : "Routing you into fleet operations.";

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <Card className="w-full max-w-sm">
        <CardContent className="items-center gap-5 p-6">
          <View className="h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <Icon icon={DeliveryTruck02Icon} color={foregroundColor} size={30} />
          </View>
          <View className="items-center gap-2">
            <Text className="text-xs font-medium uppercase tracking-[1.8px] text-primary">
              Zendak Mobile
            </Text>
            <CardTitle className="text-center">Preparing operations</CardTitle>
            <CardDescription className="text-center">
              {statusText}
            </CardDescription>
          </View>
          <View className="flex-row items-center gap-2 rounded-xl bg-secondary px-3 py-2">
            <Icon icon={Loading03Icon} className="text-foreground" size={18} />
            <Text className="text-sm text-foreground">Fleet, trips, and finance are loading.</Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
