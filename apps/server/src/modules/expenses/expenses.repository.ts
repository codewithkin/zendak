import prisma from "@zendak/db";
import type { ExpenseType } from "@zendak/db/prisma/generated/client";

import type { UpdateExpenseInput } from "./expenses.schema";

export const expensesRepository = {
	async create(data: {
		amount: number;
		type: ExpenseType;
		description?: string;
		tripId?: string;
		truckId?: string;
		driverId?: string;
	}) {
		return prisma.expense.create({
			data: { ...data, amount: data.amount },
			include: { trip: true, truck: true, driver: true },
		});
	},

	async findAll(filters?: {
		tripId?: string;
		truckId?: string;
		type?: ExpenseType;
	}) {
		return prisma.expense.findMany({
			where: {
				...(filters?.tripId && { tripId: filters.tripId }),
				...(filters?.truckId && { truckId: filters.truckId }),
				...(filters?.type && { type: filters.type }),
			},
			include: { trip: true, truck: true, driver: true },
			orderBy: { createdAt: "desc" },
		});
	},

	async findById(id: string) {
		return prisma.expense.findUnique({
			where: { id },
			include: { trip: true, truck: true, driver: true },
		});
	},

	async update(id: string, data: UpdateExpenseInput) {
		return prisma.expense.update({
			where: { id },
			data,
			include: { trip: true, truck: true, driver: true },
		});
	},

	async delete(id: string) {
		return prisma.expense.delete({ where: { id } });
	},

	async sumByTripId(tripId: string) {
		const result = await prisma.expense.aggregate({
			where: { tripId },
			_sum: { amount: true },
		});
		return result._sum.amount?.toNumber() ?? 0;
	},

	async sumByTruckId(truckId: string) {
		const result = await prisma.expense.aggregate({
			where: { truckId },
			_sum: { amount: true },
		});
		return result._sum.amount?.toNumber() ?? 0;
	},
};
