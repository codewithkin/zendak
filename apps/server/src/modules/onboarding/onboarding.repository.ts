import prisma from "@zendak/db";

export const onboardingRepository = {
	async createBusiness(data: {
		name: string;
		location: string;
		truckCount: number;
		employeeCount: number;
		phone?: string;
		ownerId: string;
	}) {
		return prisma.business.create({
			data: {
				name: data.name,
				location: data.location,
				truckCount: data.truckCount,
				employeeCount: data.employeeCount,
				phone: data.phone,
				users: { connect: { id: data.ownerId } },
			},
		});
	},

	async markUserOnboarded(userId: string, businessId: string) {
		return prisma.user.update({
			where: { id: userId },
			data: {
				onboardedAt: new Date(),
				businessId,
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				active: true,
				onboardedAt: true,
				businessId: true,
				createdAt: true,
			},
		});
	},
};
