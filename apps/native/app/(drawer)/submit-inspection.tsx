import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateInspection, type InspectionResult } from "@/src/hooks/use-inspections";

const results: InspectionResult[] = ["PASS", "FAIL", "NEEDS_ATTENTION"];

const resultColors: Record<InspectionResult, { bg: string; bgActive: string; text: string; textActive: string }> = {
  PASS: { bg: "border-border bg-background", bgActive: "border-green-600 bg-green-600", text: "text-foreground", textActive: "text-white" },
  FAIL: { bg: "border-border bg-background", bgActive: "border-red-600 bg-red-600", text: "text-foreground", textActive: "text-white" },
  NEEDS_ATTENTION: { bg: "border-border bg-background", bgActive: "border-amber-500 bg-amber-500", text: "text-foreground", textActive: "text-white" },
};

const ITEMS = ["tires", "brakes", "lights", "fluids", "body", "overall"] as const;
type InspectionItem = (typeof ITEMS)[number];

export default function SubmitInspectionScreen() {
  const [truckId, setTruckId] = useState("");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checks, setChecks] = useState<Record<InspectionItem, InspectionResult>>({
    tires: "PASS",
    brakes: "PASS",
    lights: "PASS",
    fluids: "PASS",
    body: "PASS",
    overall: "PASS",
  });

  const createInspection = useCreateInspection();
  const router = useRouter();

  const setCheck = (item: InspectionItem, result: InspectionResult) => {
    setChecks((prev) => ({ ...prev, [item]: result }));
  };

  const handleSubmit = async () => {
    if (!truckId.trim()) {
      Alert.alert("Error", "Please enter a truck ID.");
      return;
    }

    setSubmitting(true);
    try {
      await createInspection.mutateAsync({
        truckId: truckId.trim(),
        ...checks,
        notes: notes.trim() || undefined,
        mileage: mileage ? Number(mileage) : undefined,
      });

      Alert.alert("Success", "Inspection submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to submit inspection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="mb-6 text-lg font-bold text-foreground">Vehicle Inspection</Text>

        <View className="gap-5">
          <View className="gap-1.5">
            <Text className="text-xs font-medium text-foreground">Truck ID</Text>
            <Input
              placeholder="Enter truck ID"
              value={truckId}
              onChangeText={setTruckId}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-xs font-medium text-foreground">Mileage (optional)</Text>
            <Input
              placeholder="Current odometer reading"
              value={mileage}
              onChangeText={setMileage}
              keyboardType="numeric"
            />
          </View>

          {ITEMS.map((item) => (
            <View key={item} className="gap-1.5">
              <Text className="text-xs font-medium capitalize text-foreground">
                {item}
              </Text>
              <View className="flex-row gap-2">
                {results.map((r) => {
                  const isActive = checks[item] === r;
                  const colors = resultColors[r];
                  return (
                    <Pressable
                      key={r}
                      className={`flex-1 items-center rounded-xl border px-2 py-2.5 ${
                        isActive ? colors.bgActive : colors.bg
                      }`}
                      onPress={() => setCheck(item, r)}
                    >
                      <Text
                        className={`text-[10px] font-medium ${
                          isActive ? colors.textActive : colors.text
                        }`}
                      >
                        {r === "NEEDS_ATTENTION" ? "ATTENTION" : r}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <View className="gap-1.5">
            <Text className="text-xs font-medium text-foreground">Notes (optional)</Text>
            <TextInput
              className="min-h-[80px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              placeholder="Additional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Button
            size="lg"
            fullWidth
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Inspection"}
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
}
