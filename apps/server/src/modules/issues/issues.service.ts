import type { IssueSeverity, IssueStatus } from "@zendak/db/prisma/generated/client";

import { AppError } from "../../lib/errors";
import type { CreateIssueInput, UpdateIssueInput } from "./issues.schema";
import { issuesRepository } from "./issues.repository";

export const issuesService = {
	async create(input: CreateIssueInput, reportedBy: string) {
		return issuesRepository.create({ ...input, reportedBy });
	},

	async findAll(filters?: {
		status?: string;
		severity?: string;
		truckId?: string;
		driverId?: string;
	}) {
		return issuesRepository.findAll({
			status: filters?.status as IssueStatus | undefined,
			severity: filters?.severity as IssueSeverity | undefined,
			truckId: filters?.truckId,
			driverId: filters?.driverId,
		});
	},

	async findById(id: string) {
		const issue = await issuesRepository.findById(id);
		if (!issue) throw AppError.notFound("Issue not found");
		return issue;
	},

	async update(id: string, input: UpdateIssueInput) {
		const existing = await issuesRepository.findById(id);
		if (!existing) throw AppError.notFound("Issue not found");
		return issuesRepository.update(id, input);
	},

	async delete(id: string) {
		const existing = await issuesRepository.findById(id);
		if (!existing) throw AppError.notFound("Issue not found");
		return issuesRepository.delete(id);
	},

	async countByStatus() {
		return issuesRepository.countByStatus();
	},
};
