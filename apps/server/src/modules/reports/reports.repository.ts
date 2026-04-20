import prisma from "@zendak/db";

export const reportsRepository = {
	async getTripReport(filters: {
		startDate?: Date;
		endDate?: Date;
		driverId?: string;
		truckId?: string;
	}) {
		const where: Record<string, unknown> = {};

		if (filters.startDate || filters.endDate) {
			where.createdAt = {};
			if (filters.startDate) (where.createdAt as Record<string, unknown>).gte = filters.startDate;
			if (filters.endDate) (where.createdAt as Record<string, unknown>).lte = filters.endDate;
		}
		if (filters.driverId) where.driverId = filters.driverId;
		if (filters.truckId) where.truckId = filters.truckId;

		return prisma.trip.findMany({
			where,
			include: {
				driver: { include: { user: { select: { name: true } } } },
				truck: { select: { plateNumber: true, model: true } },
				expenses: true,
				revenue: true,
			},
			orderBy: { createdAt: "desc" },
		});
	},

	async getFleetReport(filters: {
		startDate?: Date;
		endDate?: Date;
	}) {
		const tripWhere: Record<string, unknown> = {};
		if (filters.startDate || filters.endDate) {
			tripWhere.createdAt = {};
			if (filters.startDate) (tripWhere.createdAt as Record<string, unknown>).gte = filters.startDate;
			if (filters.endDate) (tripWhere.createdAt as Record<string, unknown>).lte = filters.endDate;
		}

		return prisma.truck.findMany({
			include: {
				trips: {
					where: tripWhere,
					include: {
						expenses: true,
						revenue: true,
					},
				},
			},
			orderBy: { plateNumber: "asc" },
		});
	},

	async getBusinessName(businessId: string) {
		const business = await prisma.business.findUnique({
			where: { id: businessId },
			select: { name: true },
		});
		return business?.name ?? "Zendak";
	},

	async getOperatingCosts(filters: {
		startDate?: Date;
		endDate?: Date;
		truckId?: string;
	}) {
		const where: Record<string, unknown> = {};
		if (filters.startDate || filters.endDate) {
			where.createdAt = {};
			if (filters.startDate) (where.createdAt as Record<string, unknown>).gte = filters.startDate;
			if (filters.endDate) (where.createdAt as Record<string, unknown>).lte = filters.endDate;
		}
		if (filters.truckId) where.truckId = filters.truckId;

		const expenses = await prisma.expense.findMany({
			where,
			include: {
				truck: { select: { id: true, plateNumber: true, model: true } },
				driver: { select: { id: true, user: { select: { name: true } } } },
				trip: { select: { id: true, origin: true, destination: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		return expenses;
	},

	async getCategoricalSpending(filters: {
		startDate?: Date;
		endDate?: Date;
	}) {
		const where: Record<string, unknown> = {};
		if (filters.startDate || filters.endDate) {
			where.createdAt = {};
			if (filters.startDate) (where.createdAt as Record<string, unknown>).gte = filters.startDate;
			if (filters.endDate) (where.createdAt as Record<string, unknown>).lte = filters.endDate;
		}

		const expenses = await prisma.expense.groupBy({
			by: ["type"],
			where,
			_sum: { amount: true },
			_count: true,
			orderBy: { _sum: { amount: "desc" } },
		});

		const total = expenses.reduce((sum, e) => sum + (e._sum.amount?.toNumber() ?? 0), 0);

		return expenses.map((e) => ({
			type: e.type,
			total: e._sum.amount?.toNumber() ?? 0,
			count: e._count,
			percentage: total > 0 ? ((e._sum.amount?.toNumber() ?? 0) / total) * 100 : 0,
		}));
	},
};
