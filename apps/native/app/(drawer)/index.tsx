import { DashboardSquare01Icon, DeliveryTruck02Icon } from "@hugeicons/core-free-icons";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export default function Home() {
  return (
    <Container className="p-6" isScrollable={false}>
      <View className="flex-1 justify-center gap-4">
        <Card>
          <CardHeader className="gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-secondary">
              <Icon icon={DashboardSquare01Icon} className="text-foreground" size={26} />
            </View>
            <View className="gap-1">
              <Text className="text-xs font-medium uppercase tracking-[1.8px] text-primary">
                Workspace
              </Text>
              <CardTitle>Zendak mobile command</CardTitle>
              <CardDescription>
                Keep a lightweight view of fleet operations, routes, and business performance while away from the desk.
              </CardDescription>
            </View>
          </CardHeader>
          <CardContent className="pt-4">
            <View className="flex-row items-center gap-3 rounded-xl bg-secondary px-4 py-3">
              <Icon icon={DeliveryTruck02Icon} className="text-foreground" size={20} />
              <Text className="flex-1 text-sm text-foreground">
                Dispatch awareness starts here.
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </Container>
  );
}
