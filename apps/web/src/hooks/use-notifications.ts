"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api";
import { env } from "@zendak/env/web";

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
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const eventSourceRef = useRef<EventSource | null>(null);

	// Fetch initial notifications
	const fetchNotifications = useCallback(async () => {
		try {
			const data = await apiClient.get<{ items: Notification[]; total: number }>(
				"/api/notifications",
			);
			setNotifications(data.items);
		} catch {
			// Silently fail
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Fetch unread count
	const fetchUnreadCount = useCallback(async () => {
		try {
			const data = await apiClient.get<{ count: number }>("/api/notifications/unread-count");
			setUnreadCount(data.count);
		} catch {
			// Silently fail
		}
	}, []);

	// Connect to SSE stream
	useEffect(() => {
		if (!apiClient.isAuthenticated()) return;

		const token = apiClient.getToken();
		const url = `${env.NEXT_PUBLIC_SERVER_URL}/api/notifications/stream?token=${encodeURIComponent(token ?? "")}`;

		const eventSource = new EventSource(url);
		eventSourceRef.current = eventSource;

		eventSource.addEventListener("notification", (event) => {
			try {
				const data = JSON.parse(event.data);
				setNotifications((prev) => [data, ...prev]);
				setUnreadCount((prev) => prev + 1);
				toast.info(data.title, { description: data.message });
			} catch {
				// Malformed event
			}
		});

		eventSource.onerror = () => {
			eventSource.close();
			// Reconnect after 5 seconds
			setTimeout(() => {
				eventSourceRef.current = null;
			}, 5000);
		};

		return () => {
			eventSource.close();
			eventSourceRef.current = null;
		};
	}, []);

	// Fetch on mount
	useEffect(() => {
		fetchNotifications();
		fetchUnreadCount();
	}, [fetchNotifications, fetchUnreadCount]);

	const markRead = useCallback(async (id: string) => {
		try {
			await apiClient.patch(`/api/notifications/${id}/read`, {});
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch {
			// Silently fail
		}
	}, []);

	const markAllRead = useCallback(async () => {
		try {
			await apiClient.patch("/api/notifications/read-all", {});
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
			setUnreadCount(0);
		} catch {
			// Silently fail
		}
	}, []);

	return {
		notifications,
		unreadCount,
		isLoading,
		markRead,
		markAllRead,
		refetch: fetchNotifications,
	};
}
