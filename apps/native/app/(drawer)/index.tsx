import { Text, View } from "react-native";

import { Container } from "@/components/container";

export default function Home() {
  return (
    <Container>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text className="text-lg font-semibold text-foreground">Home</Text>
      </View>
    </Container>
  );
}
