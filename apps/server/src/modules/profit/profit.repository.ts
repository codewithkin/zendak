import prisma from "@zendak/db";

export const profitRepository = {
	async getTripFinancials(tripId: string) {
		const [revenue, expenses] = await Promise.all([
			prisma.revenue.findUnique({ where: { tripId } }),
			prisma.expense.aggregate({
				where: { tripId },
				_sum: { amount: true },
			}),
		]);

		return {
			revenue: revenue?.amount.toNumber() ?? 0,
			expenses: expenses._sum.amount?.toNumber() ?? 0,
		};
	},

	async getTruckTrips(truckId: string) {
		return prisma.trip.findMany({
			where: { truckId },
			select: { id: true },
		});
	},

	async getSummaryData(dateFrom?: Date, dateTo?: Date) {
		const where = {
			...(dateFrom || dateTo
				? {
						createdAt: {
							...(dateFrom && { gte: dateFrom }),
							...(dateTo && { lte: dateTo }),
						},
					}
				: {}),
		};

		const [totalRevenue, totalExpenses, tripCount] = await Promise.all([
			prisma.revenue.aggregate({ where, _sum: { amount: true } }),
			prisma.expense.aggregate({ where, _sum: { amount: true } }),
			prisma.trip.count({ where }),
		]);

		return {
			totalRevenue: totalRevenue._sum.amount?.toNumber() ?? 0,
			totalExpenses: totalExpenses._sum.amount?.toNumber() ?? 0,
			tripCount,
		};
	},
};
