import { useEffect } from "react";

import { Link, Stack } from "expo-router";
import { Button } from "heroui-native";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Container } from "@/components/container";

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
          <Animated.View style={[animStyle, { alignItems: "center", gap: 16 }]}>
            <Text
              style={{ fontSize: 96, fontWeight: "700", opacity: 0.05, lineHeight: 96 }}
              aria-hidden="true"
            >
              404
            </Text>
            <View style={{ alignItems: "center", gap: 8, marginTop: -16 }}>
              <Text className="text-base font-semibold text-foreground">Page not found</Text>
              <Text
                className="text-sm text-muted text-center"
                style={{ maxWidth: 280 }}
              >
                The page you&apos;re looking for doesn&apos;t exist.
              </Text>
            </View>
          </Animated.View>
          <Animated.View style={[animStyle, { marginTop: 32 }]}>
            <Link href="/" asChild>
              <Button size="sm">
                <Button.Label>Go home</Button.Label>
              </Button>
            </Link>
          </Animated.View>
        </View>
      </Container>
    </>
  );
}
