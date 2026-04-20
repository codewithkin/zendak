import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

export interface Notification {
	id: string;
	title: string;
	message: string;
	type: string;
	read: boolean;
	metadata?: Record<string, unknown>;
	createdAt: string;
}

export function useNotifications() {
	return useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const { data } = await apiClient.http.get<{ items: Notification[]; total: number }>(
				"/api/notifications",
			);
			return data;
		},
	});
}

export function useUnreadCount() {
	return useQuery({
		queryKey: ["notifications", "unread-count"],
		queryFn: async () => {
			const { data } = await apiClient.http.get<{ count: number }>(
				"/api/notifications/unread-count",
			);
			return data.count;
		},
		refetchInterval: 30000,
	});
}

export function useMarkRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			await apiClient.http.patch(`/api/notifications/${id}/read`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
}

export function useMarkAllRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			await apiClient.http.patch("/api/notifications/read-all");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
}
