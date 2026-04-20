import { AddCircleIcon, Alert01Icon, Alert02Icon, CheckmarkCircle02Icon, DashboardSquare01Icon, DeliveryTruck02Icon } from "@hugeicons/core-free-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import React, { useCallback } from "react";
import { Pressable, Text } from "react-native";

import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/theme-toggle";

function DrawerLayout() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

  return (
    <Drawer
      screenOptions={{
        headerTintColor: themeColorForeground,
        headerStyle: { backgroundColor: themeColorBackground },
        headerTitleStyle: {
          fontWeight: "600",
          color: themeColorForeground,
        },
        headerRight: renderThemeToggle,
        drawerStyle: { backgroundColor: themeColorBackground },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "Workspace",
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>Workspace</Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Icon
              icon={DashboardSquare01Icon}
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: "Operations",
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>Operations</Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Icon
              icon={DeliveryTruck02Icon}
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable className="mr-4">
                <Icon icon={AddCircleIcon} size={24} color={themeColorForeground} />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Drawer.Screen
        name="create-report"
        options={{
          headerTitle: "New Crash Report",
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>New Report</Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Icon
              icon={Alert01Icon}
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="report-issue"
        options={{
          headerTitle: "Report Issue",
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>Report Issue</Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Icon
              icon={Alert02Icon}
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="submit-inspection"
        options={{
          headerTitle: "Vehicle Inspection",
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>Inspection</Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Icon
              icon={CheckmarkCircle02Icon}
              size={size}
              color={focused ? color : themeColorForeground}
            />
          ),
        }}
      />
    </Drawer>
  );
}

export default DrawerLayout;
