import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { router } from "expo-router";
import { Text, View } from "react-native";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

function Modal() {
  function handleClose() {
    router.back();
  }

  return (
    <Container>
      <View className="flex-1 justify-center items-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="items-center gap-4 p-6">
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-secondary">
              <Icon icon={CheckmarkCircle02Icon} className="text-foreground" size={26} />
            </View>
            <View className="items-center gap-2">
              <Text className="text-xs font-medium uppercase tracking-[1.8px] text-primary">
                Quick Action
              </Text>
              <CardTitle className="text-center">Workflow prompt</CardTitle>
              <CardDescription className="text-center">
                Use lightweight mobile prompts like this for dispatch approvals, trip checks, and finance confirmations.
              </CardDescription>
            </View>
            <Button onPress={handleClose} className="w-full" size="sm">
              Return to workspace
            </Button>
          </CardContent>
        </Card>
      </View>
    </Container>
  );
}

export default Modal;
