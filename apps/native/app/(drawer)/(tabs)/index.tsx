import { DashboardSquare01Icon, MapsLocation01Icon } from "@hugeicons/core-free-icons";
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
    <Container className="p-6">
      <View className="flex-1 justify-center">
        <Card>
          <CardHeader className="items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-secondary">
              <Icon icon={DashboardSquare01Icon} className="text-foreground" size={26} />
            </View>
            <CardTitle className="text-center">Operations overview</CardTitle>
            <CardDescription className="text-center">
              Use this tab for fast insight into mobile fleet health and active delivery flow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center gap-3 rounded-xl bg-secondary px-4 py-3">
              <Icon icon={MapsLocation01Icon} className="text-foreground" size={20} />
              <Text className="flex-1 text-sm text-foreground">
                Live route awareness belongs here.
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </Container>
  );
}
