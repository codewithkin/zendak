import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { Button, HeroUINativeProvider } from "heroui-native";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";

const queryClient = new QueryClient();

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

function StackLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ title: "Modal", presentation: "modal" }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <HeroUINativeProvider>
            <QueryClientProvider client={queryClient}>
              <StackLayout />
            </QueryClientProvider>
          </HeroUINativeProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <View style={{ alignItems: "center", gap: 16 }}>
        <Text
          style={{ fontSize: 80, fontWeight: "700", opacity: 0.05, lineHeight: 80 }}
          aria-hidden="true"
        >
          Oops
        </Text>
        <View style={{ alignItems: "center", gap: 8, marginTop: -12 }}>
          <Text className="text-base font-semibold text-foreground">Something went wrong</Text>
          <Text className="text-sm text-muted text-center" style={{ maxWidth: 280 }}>
            {__DEV__ ? error.message : "An unexpected error occurred."}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 32 }}>
        <Button size="sm" onPress={retry}>
          <Button.Label>Try again</Button.Label>
        </Button>
      </View>
    </View>
  );
}
