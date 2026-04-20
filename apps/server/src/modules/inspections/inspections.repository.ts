import prisma from "@zendak/db";

import type { CreateInspectionInput } from "./inspections.schema";

export const inspectionsRepository = {
	async create(data: CreateInspectionInput & { driverId: string }) {
		return prisma.inspectionReport.create({
			data,
			include: {
				truck: { select: { id: true, plateNumber: true, model: true } },
				driver: { select: { id: true, user: { select: { name: true } } } },
			},
		});
	},

	async findAll(filters?: { truckId?: string; driverId?: string }) {
		const where: Record<string, unknown> = {};
		if (filters?.truckId) where.truckId = filters.truckId;
		if (filters?.driverId) where.driverId = filters.driverId;

		return prisma.inspectionReport.findMany({
			where,
			include: {
				truck: { select: { id: true, plateNumber: true, model: true } },
				driver: { select: { id: true, user: { select: { name: true } } } },
			},
			orderBy: { createdAt: "desc" },
		});
	},

	async findById(id: string) {
		return prisma.inspectionReport.findUnique({
			where: { id },
			include: {
				truck: { select: { id: true, plateNumber: true, model: true } },
				driver: { select: { id: true, user: { select: { name: true } } } },
			},
		});
	},
};
