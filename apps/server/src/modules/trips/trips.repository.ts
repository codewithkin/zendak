import prisma from "@zendak/db";
import type { TripStatus } from "@zendak/db/prisma/generated/client";

import type { CreateTripInput, UpdateTripInput } from "./trips.schema";

export const tripsRepository = {
	async create(data: CreateTripInput) {
		return prisma.trip.create({
			data,
			include: {
				driver: { include: { user: { select: { name: true } } } },
				truck: true,
			},
		});
	},

	async findAll(filters?: { driverId?: string; status?: TripStatus }) {
		return prisma.trip.findMany({
			where: {
				...(filters?.driverId && { driverId: filters.driverId }),
				...(filters?.status && { status: filters.status }),
			},
			include: {
				driver: { include: { user: { select: { name: true } } } },
				truck: true,
			},
			orderBy: { createdAt: "desc" },
		});
	},

	async findById(id: string) {
		return prisma.trip.findUnique({
			where: { id },
			include: {
				driver: { include: { user: { select: { name: true } } } },
				truck: true,
				expenses: true,
				revenue: true,
			},
		});
	},

	async findPaginated(opts: { search?: string; skip: number; take: number }) {
		const where = opts.search
			? {
					OR: [
						{ origin: { contains: opts.search, mode: "insensitive" as const } },
						{ destination: { contains: opts.search, mode: "insensitive" as const } },
					],
				}
			: {};
		const [items, total] = await Promise.all([
			prisma.trip.findMany({
				where,
				include: {
					driver: { include: { user: { select: { name: true } } } },
					truck: true,
				},
				orderBy: { createdAt: "desc" },
				skip: opts.skip,
				take: opts.take,
			}),
			prisma.trip.count({ where }),
		]);
		return { items, total, hasMore: opts.skip + opts.take < total };
	},

	async update(id: string, data: UpdateTripInput) {
		return prisma.trip.update({
			where: { id },
			data,
			include: {
				driver: { include: { user: { select: { name: true } } } },
				truck: true,
			},
		});
	},

	async updateStatus(id: string, status: TripStatus, extraData?: { startedAt?: Date; completedAt?: Date }) {
		return prisma.trip.update({
			where: { id },
			data: { status, ...extraData },
			include: {
				driver: { include: { user: { select: { name: true } } } },
				truck: true,
			},
		});
	},

	async hasRevenue(id: string) {
		const revenue = await prisma.revenue.findUnique({ where: { tripId: id } });
		return revenue !== null;
	},

	async findDriverByUserId(userId: string) {
		return prisma.driver.findUnique({ where: { userId } });
	},

	async getDriverNotificationInfo(driverId: string) {
		const driver = await prisma.driver.findUnique({
			where: { id: driverId },
			include: { user: { select: { id: true, name: true, businessId: true } } },
		});
		return driver?.user ?? null;
	},
};
