import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiClient } from "./api";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

export async function registerForPushNotifications(): Promise<string | null> {
	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== "granted") {
		return null;
	}

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "Default",
			importance: Notifications.AndroidImportance.MAX,
		});
	}

	const projectId = Constants.expoConfig?.extra?.eas?.projectId;
	const tokenData = await Notifications.getExpoPushTokenAsync({
		projectId,
	});

	return tokenData.data;
}

export async function registerPushTokenWithServer(token: string): Promise<void> {
	const platform = Platform.OS === "ios" ? "IOS" : "ANDROID";
	await apiClient.http.post("/api/notifications/push-token", { token, platform });
}

export async function unregisterPushTokenFromServer(token: string): Promise<void> {
	await apiClient.http.delete("/api/notifications/push-token", { data: { token } });
}
