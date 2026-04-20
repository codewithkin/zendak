import { Alert01Icon, DashboardSquare01Icon, Notification03Icon, Route02Icon } from "@hugeicons/core-free-icons";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Text, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { useUnreadCount } from "@/src/hooks/use-notifications";

export default function TabLayout() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");
  const { data: unreadCount } = useUnreadCount();

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
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon icon={Alert01Icon} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <View>
              <Icon icon={Notification03Icon} size={size} color={color} />
              {(unreadCount ?? 0) > 0 && (
                <View className="absolute -right-1.5 -top-1 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1">
                  <Text className="text-[10px] font-bold text-white">
                    {unreadCount! > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
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
