import prisma from "@zendak/db";
import type { Role } from "@zendak/db/prisma/generated/client";

export const authRepository = {
	async createUser(data: {
		email: string;
		password: string;
		name: string;
		role?: Role;
	}) {
		return prisma.user.create({
			data: {
				email: data.email,
				password: data.password,
				name: data.name,
				role: data.role ?? "DRIVER",
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

	async findByEmail(email: string) {
		return prisma.user.findUnique({
			where: { email },
		});
	},

	async findById(id: string) {
		return prisma.user.findUnique({
			where: { id },
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
