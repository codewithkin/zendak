import prisma from "@zendak/db";

import type { Role } from "../../types";

export const usersRepository = {
	async findAllByBusinessId(businessId: string) {
		return prisma.user.findMany({
			where: { businessId },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				active: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
		});
	},

	async findBusinessById(businessId: string) {
		return prisma.business.findUnique({
			where: { id: businessId },
			select: { id: true, name: true },
		});
	},

	async createInvitedUser(data: {
		email: string;
		name: string;
		password: string;
		role: Role;
		businessId: string;
	}) {
		return prisma.user.create({
			data: {
				email: data.email,
				name: data.name,
				password: data.password,
				role: data.role,
				businessId: data.businessId,
				onboardedAt: new Date(),
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				active: true,
				createdAt: true,
			},
		});
	},
};
