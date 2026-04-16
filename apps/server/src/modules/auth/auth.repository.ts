import prisma from "@zendak/db";

export const authRepository = {
	async createUser(data: {
		email: string;
		password: string;
		name: string;
	}) {
		return prisma.user.create({
			data: {
				email: data.email,
				password: data.password,
				name: data.name,
				role: "ADMIN",
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				active: true,
				onboardedAt: true,
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
				onboardedAt: true,
				createdAt: true,
			},
		});
	},
};
