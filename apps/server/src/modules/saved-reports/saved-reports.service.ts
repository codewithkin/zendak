import { AppError } from "../../lib/errors";
import type { CreateSavedReportInput, UpdateSavedReportInput } from "./saved-reports.schema";
import { savedReportsRepository } from "./saved-reports.repository";

export const savedReportsService = {
	async create(input: CreateSavedReportInput, userId: string) {
		return savedReportsRepository.create({
			userId,
			name: input.name,
			type: input.type,
			config: input.config as Record<string, unknown>,
			schedule: input.schedule,
		});
	},

	async findByUser(userId: string) {
		return savedReportsRepository.findByUserId(userId);
	},

	async update(id: string, input: UpdateSavedReportInput, userId: string) {
		const existing = await savedReportsRepository.findById(id);
		if (!existing) throw AppError.notFound("Saved report not found");
		if (existing.userId !== userId) throw AppError.forbidden("Not your report");
		return savedReportsRepository.update(id, input);
	},

	async delete(id: string, userId: string) {
		const existing = await savedReportsRepository.findById(id);
		if (!existing) throw AppError.notFound("Saved report not found");
		if (existing.userId !== userId) throw AppError.forbidden("Not your report");
		return savedReportsRepository.delete(id);
	},
};
