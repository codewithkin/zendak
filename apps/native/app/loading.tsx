import { useEffect } from "react";

import { router } from "expo-router";
import { useThemeColor } from "heroui-native";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMe } from "@/src/hooks/use-auth";
import { apiClient } from "@/src/lib/api";

export default function LoadingScreen() {
  const insets = useSafeAreaInsets();
  const foregroundColor = useThemeColor("foreground");
  const mutedColor = useThemeColor("muted");
  const primaryColor = useThemeColor("primary");

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

  const getStatusText = async () => {
    const isAuth = await apiClient.isAuthenticated();
    if (!isAuth) return "Checking credentials...";
    if (isLoading) return "Retrieving profile...";
    if (error) return "Session expired...";
    if (user && !user.onboardedAt) return "Completing setup...";
    return "Redirecting...";
  };

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
      {/* Branded Content */}
      <View style={{ alignItems: "center", gap: 32 }}>
        {/* Zendak Branding */}
        <View style={{ alignItems: "center", gap: 12 }}>
          {/* Logo */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: primaryColor,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "700", color: "white" }}>Z</Text>
          </View>

          {/* Branding Text */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: foregroundColor }}>
            Zendak
          </Text>
        </View>

        {/* Loading Indicator */}
        <View style={{ alignItems: "center", gap: 16 }}>
          <ActivityIndicator size="large" color={primaryColor} />

          {/* Status Text */}
          <Text
            style={{
              fontSize: 13,
              color: mutedColor,
              textAlign: "center",
              maxWidth: 200,
            }}
          >
            Authenticating
          </Text>
        </View>
      </View>
    </View>
  );
}
