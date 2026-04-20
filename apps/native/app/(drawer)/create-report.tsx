import { Camera01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { useCreateCrashReport, useRequestUpload } from "@/src/hooks/use-crash-reports";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface PhotoUpload {
	uri: string;
	filename: string;
	mimeType: string;
	fileSize: number;
	uploaded?: { url: string; s3Key: string; sizeBytes: number };
}

const severities: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function CreateReportScreen() {
	const [truckId, setTruckId] = useState("");
	const [description, setDescription] = useState("");
	const [severity, setSeverity] = useState<Severity>("MEDIUM");
	const [location, setLocation] = useState("");
	const [photos, setPhotos] = useState<PhotoUpload[]>([]);
	const [submitting, setSubmitting] = useState(false);

	const createReport = useCreateCrashReport();
	const requestUpload = useRequestUpload();
	const router = useRouter();

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			quality: 0.8,
			allowsMultipleSelection: true,
			selectionLimit: 5 - photos.length,
		});

		if (result.canceled) return;

		const newPhotos: PhotoUpload[] = result.assets.map((asset) => ({
			uri: asset.uri,
			filename: asset.fileName ?? `photo-${Date.now()}.jpg`,
			mimeType: asset.mimeType ?? "image/jpeg",
			fileSize: asset.fileSize ?? 0,
		}));

		setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
	};

	const removePhoto = (index: number) => {
		setPhotos((prev) => prev.filter((_, i) => i !== index));
	};

	const uploadPhoto = async (photo: PhotoUpload): Promise<{ url: string; s3Key: string; sizeBytes: number }> => {
		// Request presigned URL
		const { uploadUrl, publicUrl, key } = await requestUpload.mutateAsync({
			filename: photo.filename,
			contentType: photo.mimeType,
			sizeBytes: photo.fileSize,
		});

		// Upload file to S3
		const response = await fetch(photo.uri);
		const blob = await response.blob();
		await fetch(uploadUrl, {
			method: "PUT",
			headers: { "Content-Type": photo.mimeType },
			body: blob,
		});

		return { url: publicUrl, s3Key: key, sizeBytes: photo.fileSize };
	};

	const handleSubmit = async () => {
		if (!truckId.trim()) {
			Alert.alert("Error", "Please enter a truck ID.");
			return;
		}
		if (!description.trim()) {
			Alert.alert("Error", "Please describe the incident.");
			return;
		}

		setSubmitting(true);
		try {
			// Upload all photos first
			const uploadedPhotos = await Promise.all(photos.map(uploadPhoto));

			await createReport.mutateAsync({
				truckId: truckId.trim(),
				description: description.trim(),
				severity,
				location: location.trim() || undefined,
				photos: uploadedPhotos,
			});

			Alert.alert("Success", "Crash report submitted.", [
				{ text: "OK", onPress: () => router.back() },
			]);
		} catch {
			Alert.alert("Error", "Failed to submit report. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Container>
			<ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
				<Text className="mb-6 text-lg font-bold text-foreground">New Crash Report</Text>

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
						<Text className="text-xs font-medium text-foreground">Description</Text>
						<TextInput
							className="min-h-[100px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
							placeholder="Describe the incident..."
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
						<Text className="text-xs font-medium text-foreground">Location (optional)</Text>
						<Input
							placeholder="e.g., Highway 101, Mile 42"
							value={location}
							onChangeText={setLocation}
						/>
					</View>

					<View className="gap-2">
						<Text className="text-xs font-medium text-foreground">
							Photos ({photos.length}/5)
						</Text>
						<View className="flex-row flex-wrap gap-2">
							{photos.map((photo, index) => (
								<View key={photo.uri} className="relative h-20 w-20">
									<Image
										source={{ uri: photo.uri }}
										className="h-full w-full rounded-xl"
									/>
									<Pressable
										className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full bg-red-500"
										onPress={() => removePhoto(index)}
									>
										<Icon icon={Delete02Icon} size={12} color="#fff" />
									</Pressable>
								</View>
							))}
							{photos.length < 5 && (
								<Pressable
									className="h-20 w-20 items-center justify-center rounded-xl border border-dashed border-border"
									onPress={pickImage}
								>
									<Icon icon={Camera01Icon} size={20} className="text-muted" />
								</Pressable>
							)}
						</View>
					</View>

					<Button
						size="lg"
						fullWidth
						onPress={handleSubmit}
						disabled={submitting}
					>
						{submitting ? "Submitting..." : "Submit Report"}
					</Button>
				</View>
			</ScrollView>
		</Container>
	);
}
