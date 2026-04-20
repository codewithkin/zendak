import prisma from "@zendak/db";

type CrashSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type CrashReportStatus = "SUBMITTED" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

export const crashReportsRepository = {
	async create(data: {
		driverId: string;
		truckId: string;
		tripId?: string;
		description: string;
		severity: CrashSeverity;
		location?: string;
		photos: { url: string; s3Key: string; sizeBytes: bigint }[];
	}) {
		return prisma.crashReport.create({
			data: {
				driverId: data.driverId,
				truckId: data.truckId,
				tripId: data.tripId,
				description: data.description,
				severity: data.severity,
				location: data.location,
				photos: {
					create: data.photos,
				},
			},
			include: { photos: true, driver: { include: { user: true } }, truck: true },
		});
	},

	async findById(id: string) {
		return prisma.crashReport.findUnique({
			where: { id },
			include: {
				photos: true,
				driver: { include: { user: true } },
				truck: true,
				trip: true,
			},
		});
	},

	async list(opts: {
		page: number;
		limit: number;
		driverId?: string;
		status?: CrashReportStatus;
		severity?: CrashSeverity;
	}) {
		const where: Record<string, unknown> = {};
		if (opts.driverId) where.driverId = opts.driverId;
		if (opts.status) where.status = opts.status;
		if (opts.severity) where.severity = opts.severity;

		const [items, total] = await Promise.all([
			prisma.crashReport.findMany({
				where,
				include: {
					photos: true,
					driver: { include: { user: { select: { name: true, email: true } } } },
					truck: { select: { plateNumber: true, model: true } },
				},
				orderBy: { createdAt: "desc" },
				skip: (opts.page - 1) * opts.limit,
				take: opts.limit,
			}),
			prisma.crashReport.count({ where }),
		]);
		return { items, total, hasMore: opts.page * opts.limit < total };
	},

	async updateStatus(id: string, status: CrashReportStatus) {
		return prisma.crashReport.update({
			where: { id },
			data: { status },
			include: { photos: true, driver: { include: { user: true } } },
		});
	},

	async getDriverIdFromUserId(userId: string) {
		const driver = await prisma.driver.findUnique({
			where: { userId },
			select: { id: true },
		});
		return driver?.id;
	},

	async incrementBusinessStorage(businessId: string, bytes: bigint) {
		await prisma.business.update({
			where: { id: businessId },
			data: { storageUsedBytes: { increment: bytes } },
		});
	},
};
