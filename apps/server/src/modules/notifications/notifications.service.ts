import { connectionManager } from "../../lib/sse";
import { sendPushNotifications } from "../../lib/push";
import type { Role } from "../../types";
import { notificationsRepository } from "./notifications.repository";

export const notificationsService = {
	async notifyUser(opts: {
		userId: string;
		title: string;
		message: string;
		type: string;
		metadata?: Record<string, unknown>;
	}) {
		const notification = await notificationsRepository.create(opts);

		// Push to SSE stream
		connectionManager.sendToUser(opts.userId, "notification", notification).catch(() => {});

		// Send mobile push
		sendPushNotifications([opts.userId], {
			title: opts.title,
			body: opts.message,
			data: { type: opts.type, ...opts.metadata },
		}).catch(() => {});

		return notification;
	},

	async notifyByRole(opts: {
		businessId: string;
		roles: Role[];
		title: string;
		message: string;
		type: string;
		metadata?: Record<string, unknown>;
	}) {
		const userIds = await notificationsRepository.getUserIdsByRole(opts.businessId, opts.roles);
		if (userIds.length === 0) return;

		const notifications = userIds.map((userId) => ({
			userId,
			title: opts.title,
			message: opts.message,
			type: opts.type,
			metadata: opts.metadata,
		}));
		await notificationsRepository.createMany(notifications);

		// Push to SSE streams
		const payload = { title: opts.title, message: opts.message, type: opts.type, metadata: opts.metadata };
		connectionManager.sendToUsers(userIds, "notification", payload).catch(() => {});

		// Send mobile push
		sendPushNotifications(userIds, {
			title: opts.title,
			body: opts.message,
			data: { type: opts.type, ...opts.metadata },
		}).catch(() => {});
	},

	async notifyAllAdmins(opts: {
		businessId: string;
		title: string;
		message: string;
		type: string;
		metadata?: Record<string, unknown>;
	}) {
		return this.notifyByRole({ ...opts, roles: ["ADMIN"] });
	},

	async notifyBusiness(opts: {
		businessId: string;
		title: string;
		message: string;
		type: string;
		metadata?: Record<string, unknown>;
	}) {
		const userIds = await notificationsRepository.getUserIdsByBusiness(opts.businessId);
		if (userIds.length === 0) return;

		const notifications = userIds.map((userId) => ({
			userId,
			title: opts.title,
			message: opts.message,
			type: opts.type,
			metadata: opts.metadata,
		}));
		await notificationsRepository.createMany(notifications);

		const payload = { title: opts.title, message: opts.message, type: opts.type, metadata: opts.metadata };
		connectionManager.sendToUsers(userIds, "notification", payload).catch(() => {});

		sendPushNotifications(userIds, {
			title: opts.title,
			body: opts.message,
			data: { type: opts.type, ...opts.metadata },
		}).catch(() => {});
	},

	async list(userId: string, page: number, limit: number) {
		return notificationsRepository.list(userId, page, limit);
	},

	async countUnread(userId: string) {
		return notificationsRepository.countUnread(userId);
	},

	async markRead(id: string, userId: string) {
		return notificationsRepository.markRead(id, userId);
	},

	async markAllRead(userId: string) {
		return notificationsRepository.markAllRead(userId);
	},
};
