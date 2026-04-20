import { Alert01Icon, Tick01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useCrashReports, type CrashReport } from "@/src/hooks/use-crash-reports";

const severityColors = {
	LOW: "bg-green-100 text-green-700",
	MEDIUM: "bg-yellow-100 text-yellow-700",
	HIGH: "bg-orange-100 text-orange-700",
	CRITICAL: "bg-red-100 text-red-700",
} as const;

const statusIcons = {
	SUBMITTED: Alert01Icon,
	UNDER_REVIEW: ViewIcon,
	RESOLVED: Tick01Icon,
	DISMISSED: Tick01Icon,
} as const;

function ReportItem({ report }: { report: CrashReport }) {
	return (
		<Card className="mb-3">
			<CardContent className="gap-3 p-4">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-2">
						<Icon icon={statusIcons[report.status]} size={16} className="text-muted" />
						<Text className="text-xs font-medium text-muted">
							{report.status.replace("_", " ")}
						</Text>
					</View>
					<View className={`rounded-md px-2 py-0.5 ${severityColors[report.severity].split(" ")[0]}`}>
						<Text className={`text-xs font-semibold ${severityColors[report.severity].split(" ")[1]}`}>
							{report.severity}
						</Text>
					</View>
				</View>

				<Text className="text-sm text-foreground" numberOfLines={2}>
					{report.description}
				</Text>

				<View className="flex-row items-center justify-between">
					<Text className="text-xs text-muted">
						{report.truck?.plateNumber ?? "Unknown truck"}
					</Text>
					<Text className="text-xs text-muted">
						{new Date(report.createdAt).toLocaleDateString()}
					</Text>
				</View>

				{report.photos.length > 0 && (
					<Text className="text-xs text-muted">
						{report.photos.length} photo{report.photos.length > 1 ? "s" : ""} attached
					</Text>
				)}
			</CardContent>
		</Card>
	);
}

export default function ReportsScreen() {
	const { data, isLoading, refetch } = useCrashReports();
	const router = useRouter();

	return (
		<Container className="px-4 pt-4">
			<View className="mb-4 flex-row items-center justify-between">
				<Text className="text-lg font-bold text-foreground">Crash Reports</Text>
				<Pressable
					className="rounded-xl bg-primary px-4 py-2"
					onPress={() => router.push("/(drawer)/create-report")}
				>
					<Text className="text-sm font-medium text-primary-foreground">New Report</Text>
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
					renderItem={({ item }) => <ReportItem report={item} />}
					onRefresh={refetch}
					refreshing={isLoading}
					ListEmptyComponent={
						<View className="items-center justify-center py-12">
							<Text className="text-sm text-muted">No crash reports yet</Text>
						</View>
					}
					contentContainerStyle={{ paddingBottom: 24 }}
				/>
			)}
		</Container>
	);
}
