import { useEffect } from "react";

import { Home01Icon, MapsSearchIcon } from "@hugeicons/core-free-icons";
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Container } from "@/components/container";
import { Button, ButtonLabel } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export default function NotFoundScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
    translateY.value = withSpring(0, { damping: 20, stiffness: 180 });
  }, [opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Container isScrollable={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Animated.View style={[animStyle, { width: "100%", maxWidth: 360 }]}> 
            <Card>
              <CardContent className="items-center gap-4 p-6">
                <View className="h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                  <Icon icon={MapsSearchIcon} className="text-foreground" size={26} />
                </View>
                <View className="items-center gap-2">
                  <Text className="text-xs font-medium uppercase tracking-[1.8px] text-primary">
                    Route Missing
                  </Text>
                  <CardTitle className="text-center">This screen is off the map</CardTitle>
                  <CardDescription className="text-center">
                    This Zendak mobile route doesn&apos;t exist in your logistics workspace.
                  </CardDescription>
                </View>
              </CardContent>
            </Card>
          </Animated.View>
          <Animated.View style={[animStyle, { marginTop: 32 }]}>
            <Link href="/" asChild>
              <Button size="sm">
                <Icon icon={Home01Icon} className="text-primary-foreground" size={18} />
                <ButtonLabel>Return to workspace</ButtonLabel>
              </Button>
            </Link>
          </Animated.View>
        </View>
      </Container>
    </>
  );
}
