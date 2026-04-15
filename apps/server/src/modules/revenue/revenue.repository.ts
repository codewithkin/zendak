import prisma from "@zendak/db";

import type { UpdateRevenueInput } from "./revenue.schema";

export const revenueRepository = {
	async create(data: { amount: number; tripId: string; notes?: string }) {
		return prisma.revenue.create({
			data,
			include: { trip: true },
		});
	},

	async findAll() {
		return prisma.revenue.findMany({
			include: { trip: true },
			orderBy: { createdAt: "desc" },
		});
	},

	async findById(id: string) {
		return prisma.revenue.findUnique({
			where: { id },
			include: { trip: true },
		});
	},

	async findByTripId(tripId: string) {
		return prisma.revenue.findUnique({
			where: { tripId },
			include: { trip: true },
		});
	},

	async update(id: string, data: UpdateRevenueInput) {
		return prisma.revenue.update({
			where: { id },
			data,
			include: { trip: true },
		});
	},

	async getAmountByTripId(tripId: string): Promise<number> {
		const revenue = await prisma.revenue.findUnique({ where: { tripId } });
		return revenue?.amount.toNumber() ?? 0;
	},
};
