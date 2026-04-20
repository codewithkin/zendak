import prisma from "@zendak/db";
import type { IssueStatus, IssueSeverity } from "@zendak/db/prisma/generated/client";

import type { CreateIssueInput, UpdateIssueInput } from "./issues.schema";

const SEVERITY_ORDER: Record<string, number> = {
	CRITICAL: 0,
	HIGH: 1,
	MEDIUM: 2,
	LOW: 3,
};

export const issuesRepository = {
	async create(data: CreateIssueInput & { reportedBy: string }) {
		return prisma.issue.create({
			data,
			include: {
				truck: { select: { id: true, plateNumber: true } },
				driver: { select: { id: true, user: { select: { name: true } } } },
				reporter: { select: { id: true, name: true } },
			},
		});
	},

	async findAll(filters?: {
		status?: IssueStatus;
		severity?: IssueSeverity;
		truckId?: string;
		driverId?: string;
	}) {
		const where: Record<string, unknown> = {};
		if (filters?.status) where.status = filters.status;
		if (filters?.severity) where.severity = filters.severity;
		if (filters?.truckId) where.truckId = filters.truckId;
		if (filters?.driverId) where.driverId = filters.driverId;

		const issues = await prisma.issue.findMany({
			where,
			include: {
				truck: { select: { id: true, plateNumber: true } },
				driver: { select: { id: true, user: { select: { name: true } } } },
				reporter: { select: { id: true, name: true } },
			},
			orderBy: [{ createdAt: "desc" }],
		});

		// Sort by severity (CRITICAL first) then by createdAt desc
		return issues.sort((a, b) => {
			const sevDiff = (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
			if (sevDiff !== 0) return sevDiff;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	},

	async findById(id: string) {
		return prisma.issue.findUnique({
			where: { id },
			include: {
				truck: { select: { id: true, plateNumber: true } },
				driver: { select: { id: true, user: { select: { name: true } } } },
				reporter: { select: { id: true, name: true } },
			},
		});
	},

	async update(id: string, data: UpdateIssueInput) {
		return prisma.issue.update({
			where: { id },
			data,
			include: {
				truck: { select: { id: true, plateNumber: true } },
				driver: { select: { id: true, user: { select: { name: true } } } },
				reporter: { select: { id: true, name: true } },
			},
		});
	},

	async delete(id: string) {
		return prisma.issue.delete({ where: { id } });
	},

	async countByStatus() {
		const [open, inProgress, resolved, closed] = await Promise.all([
			prisma.issue.count({ where: { status: "OPEN" } }),
			prisma.issue.count({ where: { status: "IN_PROGRESS" } }),
			prisma.issue.count({ where: { status: "RESOLVED" } }),
			prisma.issue.count({ where: { status: "CLOSED" } }),
		]);
		return { open, inProgress, resolved, closed, total: open + inProgress + resolved + closed };
	},
};
