import { Notification03Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
	useMarkAllRead,
	useMarkRead,
	useNotifications,
	type Notification,
} from "@/src/hooks/use-notifications";

function NotificationItem({
	notification,
	onPress,
}: {
	notification: Notification;
	onPress: () => void;
}) {
	return (
		<Pressable onPress={onPress}>
			<Card className={`mb-3 ${!notification.read ? "border-primary/30" : ""}`}>
				<CardContent className="gap-2 p-4">
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-2">
							<View
								className={`h-2 w-2 rounded-full ${
									notification.read ? "bg-transparent" : "bg-primary"
								}`}
							/>
							<Text className="text-xs font-semibold uppercase tracking-wider text-primary">
								{notification.type.replace(/_/g, " ")}
							</Text>
						</View>
						<Text className="text-xs text-muted">
							{formatTimeAgo(notification.createdAt)}
						</Text>
					</View>
					<Text className="text-sm font-medium text-foreground">{notification.title}</Text>
					<Text className="text-xs text-muted">{notification.message}</Text>
				</CardContent>
			</Card>
		</Pressable>
	);
}

function formatTimeAgo(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export default function NotificationsScreen() {
	const { data, isLoading, refetch } = useNotifications();
	const markRead = useMarkRead();
	const markAllRead = useMarkAllRead();

	const handlePress = (notification: Notification) => {
		if (!notification.read) {
			markRead.mutate(notification.id);
		}
	};

	return (
		<Container className="px-4 pt-4">
			<View className="mb-4 flex-row items-center justify-between">
				<View className="flex-row items-center gap-2">
					<Icon icon={Notification03Icon} size={20} className="text-foreground" />
					<Text className="text-lg font-bold text-foreground">Notifications</Text>
				</View>
				<Pressable
					className="flex-row items-center gap-1 rounded-lg px-3 py-1.5"
					onPress={() => markAllRead.mutate()}
				>
					<Icon icon={Tick01Icon} size={14} className="text-primary" />
					<Text className="text-xs font-medium text-primary">Mark all read</Text>
				</Pressable>
			</View>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator />
				</View>
			) : (
				<FlatList
					data={data?.items ?? []}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<NotificationItem notification={item} onPress={() => handlePress(item)} />
					)}
					onRefresh={refetch}
					refreshing={isLoading}
					ListEmptyComponent={
						<View className="items-center justify-center py-12">
							<Icon icon={Notification03Icon} size={32} className="mb-3 text-muted" />
							<Text className="text-sm text-muted">No notifications yet</Text>
						</View>
					}
					contentContainerStyle={{ paddingBottom: 24 }}
				/>
			)}
		</Container>
	);
}
