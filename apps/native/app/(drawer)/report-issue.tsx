import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateIssue, type IssueSeverity } from "@/src/hooks/use-issues";

const severities: IssueSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ReportIssueScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("MEDIUM");
  const [truckId, setTruckId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const createIssue = useCreateIssue();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please describe the issue.");
      return;
    }

    setSubmitting(true);
    try {
      await createIssue.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        severity,
        truckId: truckId.trim() || undefined,
      });

      Alert.alert("Success", "Issue reported.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to report issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="mb-6 text-lg font-bold text-foreground">Report Issue</Text>

        <View className="gap-5">
          <View className="gap-1.5">
            <Text className="text-xs font-medium text-foreground">Title</Text>
            <Input
              placeholder="Brief issue description"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-xs font-medium text-foreground">Description</Text>
            <TextInput
              className="min-h-[100px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              placeholder="Detailed description of the issue..."
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-xs font-medium text-foreground">Severity</Text>
            <View className="flex-row gap-2">
              {severities.map((s) => (
                <Pressable
                  key={s}
                  className={`flex-1 items-center rounded-xl border px-2 py-2.5 ${
                    severity === s
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  }`}
                  onPress={() => setSeverity(s)}
                >
                  <Text
                    className={`text-xs font-medium ${
                      severity === s ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="text-xs font-medium text-foreground">Truck ID (optional)</Text>
            <Input
              placeholder="Enter truck ID"
              value={truckId}
              onChangeText={setTruckId}
            />
          </View>

          <Button
            size="lg"
            fullWidth
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Report Issue"}
          </Button>
        </View>
      </ScrollView>
    </Container>
  );
}
