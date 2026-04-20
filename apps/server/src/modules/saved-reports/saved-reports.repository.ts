import prisma from "@zendak/db";

export const savedReportsRepository = {
	async create(data: {
		userId: string;
		name: string;
		type: string;
		config: Record<string, unknown>;
		schedule?: string;
	}) {
		return prisma.savedReport.create({ data });
	},

	async findByUserId(userId: string) {
		return prisma.savedReport.findMany({
			where: { userId },
			orderBy: { updatedAt: "desc" },
		});
	},

	async findById(id: string) {
		return prisma.savedReport.findUnique({ where: { id } });
	},

	async update(id: string, data: {
		name?: string;
		config?: Record<string, unknown>;
		schedule?: string | null;
	}) {
		return prisma.savedReport.update({ where: { id }, data });
	},

	async delete(id: string) {
		return prisma.savedReport.delete({ where: { id } });
	},
};
