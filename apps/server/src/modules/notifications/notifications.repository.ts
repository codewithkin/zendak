import prisma from "@zendak/db";
import type { Role } from "../../types";

export const notificationsRepository = {
	async create(data: {
		userId: string;
		title: string;
		message: string;
		type: string;
		metadata?: Record<string, unknown>;
	}) {
		return prisma.notification.create({ data });
	},

	async createMany(
		notifications: {
			userId: string;
			title: string;
			message: string;
			type: string;
			metadata?: Record<string, unknown>;
		}[],
	) {
		return prisma.notification.createMany({ data: notifications });
	},

	async list(userId: string, page: number, limit: number) {
		const [items, total] = await Promise.all([
			prisma.notification.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			prisma.notification.count({ where: { userId } }),
		]);
		return { items, total, hasMore: page * limit < total };
	},

	async countUnread(userId: string) {
		return prisma.notification.count({
			where: { userId, read: false },
		});
	},

	async markRead(id: string, userId: string) {
		return prisma.notification.updateMany({
			where: { id, userId },
			data: { read: true },
		});
	},

	async markAllRead(userId: string) {
		return prisma.notification.updateMany({
			where: { userId, read: false },
			data: { read: true },
		});
	},

	async getUserIdsByRole(businessId: string, roles: Role[]) {
		const users = await prisma.user.findMany({
			where: { businessId, role: { in: roles }, active: true },
			select: { id: true },
		});
		return users.map((u) => u.id);
	},

	async getUserIdsByBusiness(businessId: string) {
		const users = await prisma.user.findMany({
			where: { businessId, active: true },
			select: { id: true },
		});
		return users.map((u) => u.id);
	},

	async registerPushToken(userId: string, token: string, platform: "IOS" | "ANDROID" | "WEB") {
		return prisma.pushToken.upsert({
			where: { token },
			create: { userId, token, platform },
			update: { userId, platform },
		});
	},

	async removePushToken(token: string) {
		return prisma.pushToken.deleteMany({ where: { token } });
	},
};
