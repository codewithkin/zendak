import { DashboardSquare01Icon, Route02Icon } from "@hugeicons/core-free-icons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";

import { Icon } from "@/components/ui/icon";

export default function TabLayout() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: themeColorBackground,
        },
        headerTintColor: themeColorForeground,
        headerTitleStyle: {
          color: themeColorForeground,
          fontWeight: "600",
        },
        tabBarStyle: {
          backgroundColor: themeColorBackground,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon icon={DashboardSquare01Icon} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Routes",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon icon={Route02Icon} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
