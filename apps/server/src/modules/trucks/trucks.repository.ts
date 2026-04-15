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
};
