import prisma from "@zendak/db";
import type { TruckStatus } from "@zendak/db/prisma/generated/client";

import type { CreateTruckInput, UpdateTruckInput } from "./trucks.schema";

export const trucksRepository = {
	async create(data: CreateTruckInput) {
		return prisma.truck.create({ data });
	},

	async findAll() {
		return prisma.truck.findMany({
			orderBy: { createdAt: "desc" },
		});
	},

	async findById(id: string) {
		return prisma.truck.findUnique({ where: { id } });
	},

	async findByPlateNumber(plateNumber: string) {
		return prisma.truck.findUnique({ where: { plateNumber } });
	},

	async findPaginated(opts: { search?: string; skip: number; take: number; status?: TruckStatus }) {
		const where = {
			...(opts.status ? { status: opts.status } : {}),
			...(opts.search
				? {
						OR: [
							{ plateNumber: { contains: opts.search, mode: "insensitive" as const } },
							{ model: { contains: opts.search, mode: "insensitive" as const } },
						],
					}
				: {}),
		};
		const [items, total] = await Promise.all([
			prisma.truck.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: opts.skip,
				take: opts.take,
			}),
			prisma.truck.count({ where }),
		]);
		return { items, total, hasMore: opts.skip + opts.take < total };
	},

	async update(id: string, data: UpdateTruckInput) {
		return prisma.truck.update({ where: { id }, data });
	},

	async updateStatus(id: string, status: TruckStatus) {
		return prisma.truck.update({ where: { id }, data: { status } });
	},

	async hasActiveTrips(id: string) {
		const count = await prisma.trip.count({
			where: { truckId: id, status: { in: ["PLANNED", "ACTIVE"] } },
		});
		return count > 0;
	},

	async getDetailById(id: string) {
		return prisma.truck.findUnique({
			where: { id },
			include: {
				trips: {
					include: {
						driver: { include: { user: { select: { name: true } } } },
						expenses: true,
						revenue: true,
					},
					orderBy: { createdAt: "desc" },
				},
				expenses: {
					include: {
						trip: { select: { id: true, origin: true, destination: true } },
						driver: { select: { id: true, user: { select: { name: true } } } },
					},
					orderBy: { createdAt: "desc" },
				},
				serviceReminders: {
					orderBy: { dueDate: "asc" },
				},
				crashReports: {
					include: {
						driver: { include: { user: { select: { name: true } } } },
					},
					orderBy: { createdAt: "desc" },
				},
				issues: {
					include: {
						reporter: { select: { name: true } },
					},
					orderBy: { createdAt: "desc" },
				},
			},
		});
	},
};
