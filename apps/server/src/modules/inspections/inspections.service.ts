import prisma from "@zendak/db";

import { AppError } from "../../lib/errors";
import type { CreateInspectionInput } from "./inspections.schema";
import { inspectionsRepository } from "./inspections.repository";

export const inspectionsService = {
	async create(input: CreateInspectionInput, userId: string) {
		// Look up the driver record for this user
		const driver = await prisma.driver.findUnique({ where: { userId } });
		if (!driver) throw AppError.badRequest("No driver profile found for this user");

		return inspectionsRepository.create({ ...input, driverId: driver.id });
	},

	async findAll(filters?: { truckId?: string; driverId?: string }) {
		return inspectionsRepository.findAll(filters);
	},

	async findById(id: string) {
		const inspection = await inspectionsRepository.findById(id);
		if (!inspection) throw AppError.notFound("Inspection not found");
		return inspection;
	},
};
