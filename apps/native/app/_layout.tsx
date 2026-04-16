import "@/global.css";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

function StackLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ title: "Quick Action", presentation: "modal" }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <HeroUINativeProvider>
            <StackLayout />
          </HeroUINativeProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Card className="w-full max-w-sm">
        <CardContent className="items-center gap-4 p-6">
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-secondary">
            <Icon icon={AlertCircleIcon} className="text-foreground" size={26} />
          </View>
          <View className="items-center gap-2">
            <Text className="text-xs font-medium uppercase tracking-[1.8px] text-primary">
              Zendak Mobile
            </Text>
            <CardTitle className="text-center">Operational issue detected</CardTitle>
            <CardDescription className="text-center">
              {__DEV__
                ? error.message
                : "This part of your logistics workspace failed to load. Retry to continue."}
            </CardDescription>
          </View>
          <Button size="sm" fullWidth onPress={retry}>
            Try again
          </Button>
        </CardContent>
      </Card>
      <View style={{ marginTop: 16 }}>
        <Text className="text-xs text-muted">Keep fleet, routes, and finance in sync.</Text>
      </View>
    </View>
  );
}
