import Expo, { type ExpoPushMessage } from "expo-server-sdk";

import prisma from "@zendak/db";

const expo = new Expo();

export async function sendPushNotifications(
	userIds: string[],
	opts: { title: string; body: string; data?: Record<string, unknown> },
) {
	if (userIds.length === 0) return;

	const tokens = await prisma.pushToken.findMany({
		where: { userId: { in: userIds } },
		select: { token: true, id: true },
	});

	if (tokens.length === 0) return;

	const messages: ExpoPushMessage[] = [];
	const validTokenIds: string[] = [];

	for (const { token, id } of tokens) {
		if (!Expo.isExpoPushToken(token)) continue;
		validTokenIds.push(id);
		messages.push({
			to: token,
			sound: "default",
			title: opts.title,
			body: opts.body,
			data: opts.data,
		});
	}

	if (messages.length === 0) return;

	const chunks = expo.chunkPushNotifications(messages);

	for (const chunk of chunks) {
		try {
			const tickets = await expo.sendPushNotificationsAsync(chunk);
			for (let i = 0; i < tickets.length; i++) {
				const ticket = tickets[i];
				if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
					// Clean up stale token
					prisma.pushToken.delete({ where: { id: validTokenIds[i] } }).catch(() => {});
				}
			}
		} catch {
			// Fire and forget — don't block on push failures
		}
	}
}
