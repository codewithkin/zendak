"use client";
import { Notification03Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { useRef, useState, useEffect } from "react";

import { Icon } from "@zendak/ui/components/icon";

import { useNotifications, type Notification } from "@/hooks/use-notifications";

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

function NotificationItem({
	notification,
	onClick,
}: {
	notification: Notification;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${
				!notification.read ? "bg-primary/5" : ""
			}`}
			onClick={onClick}
		>
			<div className="flex items-start gap-2">
				{!notification.read && (
					<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
				)}
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<p className="truncate text-xs font-semibold text-foreground">
							{notification.title}
						</p>
						<span className="shrink-0 text-[10px] text-muted-foreground">
							{formatTimeAgo(notification.createdAt)}
						</span>
					</div>
					<p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
						{notification.message}
					</p>
				</div>
			</div>
		</button>
	);
}

export function NotificationBell() {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

	// Close on outside click
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		if (open) {
			document.addEventListener("mousedown", handleClick);
			return () => document.removeEventListener("mousedown", handleClick);
		}
	}, [open]);

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
				onClick={() => setOpen(!open)}
				aria-label="Notifications"
			>
				<Icon icon={Notification03Icon} size={18} className="text-foreground" />
				{unreadCount > 0 && (
					<span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
					<div className="flex items-center justify-between border-b border-border px-4 py-3">
						<h3 className="text-sm font-semibold text-foreground">Notifications</h3>
						{unreadCount > 0 && (
							<button
								type="button"
								className="flex items-center gap-1 text-xs text-primary hover:underline"
								onClick={() => markAllRead()}
							>
								<Icon icon={Tick01Icon} size={12} />
								Mark all read
							</button>
						)}
					</div>
					<div className="max-h-80 overflow-y-auto">
						{notifications.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
								<Icon icon={Notification03Icon} size={24} className="mb-2 opacity-50" />
								<p className="text-xs">No notifications</p>
							</div>
						) : (
							notifications.slice(0, 20).map((n) => (
								<NotificationItem
									key={n.id}
									notification={n}
									onClick={() => {
										if (!n.read) markRead(n.id);
									}}
								/>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
