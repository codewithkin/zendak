import type { Context } from "hono";
import { streamSSE } from "hono/streaming";

import { AppError } from "../../lib/errors";
import { connectionManager } from "../../lib/sse";
import type { AuthEnv } from "../../types";
import { notificationsService } from "./notifications.service";
import { notificationsRepository } from "./notifications.repository";
import {
	listNotificationsSchema,
	registerPushTokenSchema,
	removePushTokenSchema,
} from "./notifications.schema";

export const notificationsController = {
	stream(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		return streamSSE(c, async (stream) => {
			const writer = {
				writeSSE: stream.writeSSE.bind(stream),
			};

			connectionManager.addConnection(user.id, writer);

			// Send initial unread count
			const unreadCount = await notificationsService.countUnread(user.id);
			await stream.writeSSE({
				event: "unread-count",
				data: JSON.stringify({ count: unreadCount }),
			});

			// Keep connection alive with heartbeat
			const heartbeat = setInterval(() => {
				stream.writeSSE({ event: "ping", data: "" }).catch(() => {
					clearInterval(heartbeat);
				});
			}, 30_000);

			stream.onAbort(() => {
				clearInterval(heartbeat);
				connectionManager.removeConnection(user.id, writer);
			});

			// Keep the stream open — Hono handles the connection lifecycle
			await new Promise<void>((resolve) => {
				stream.onAbort(resolve);
			});
		});
	},

	async list(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const query = c.req.query();
		const parsed = listNotificationsSchema.safeParse(query);
		if (!parsed.success) throw AppError.badRequest(parsed.error.errors[0].message);

		const result = await notificationsService.list(user.id, parsed.data.page, parsed.data.limit);
		return c.json(result, 200);
	},

	async unreadCount(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const count = await notificationsService.countUnread(user.id);
		return c.json({ count }, 200);
	},

	async markRead(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const { id } = c.req.param();
		await notificationsService.markRead(id, user.id);
		return c.json({ ok: true }, 200);
	},

	async markAllRead(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		await notificationsService.markAllRead(user.id);
		return c.json({ ok: true }, 200);
	},

	async registerPushToken(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const body = await c.req.json();
		const parsed = registerPushTokenSchema.safeParse(body);
		if (!parsed.success) throw AppError.badRequest(parsed.error.errors[0].message);

		await notificationsRepository.registerPushToken(user.id, parsed.data.token, parsed.data.platform);
		return c.json({ ok: true }, 200);
	},

	async removePushToken(c: Context<AuthEnv>) {
		const user = c.get("user");
		if (!user) throw AppError.unauthorized();

		const body = await c.req.json();
		const parsed = removePushTokenSchema.safeParse(body);
		if (!parsed.success) throw AppError.badRequest(parsed.error.errors[0].message);

		await notificationsRepository.removePushToken(parsed.data.token);
		return c.json({ ok: true }, 200);
	},
};
