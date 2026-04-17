import prisma from "@zendak/db";

export const driversRepository = {
	async create(data: {
		userId: string;
		licenseNo: string;
		phone?: string;
	}) {
		return prisma.driver.create({
			data,
			include: { user: { select: { id: true, email: true, name: true, role: true } } },
		});
	},

	async findAll() {
		return prisma.driver.findMany({
			include: { user: { select: { id: true, email: true, name: true, role: true, active: true } } },
			orderBy: { createdAt: "desc" },
		});
	},

	async findById(id: string) {
		return prisma.driver.findUnique({
			where: { id },
			include: { user: { select: { id: true, email: true, name: true, role: true, active: true } } },
		});
	},

	async findByUserId(userId: string) {
		return prisma.driver.findUnique({
			where: { userId },
			include: { user: { select: { id: true, email: true, name: true, role: true, active: true } } },
		});
	},

	async findByLicenseNo(licenseNo: string) {
		return prisma.driver.findUnique({ where: { licenseNo } });
	},

	async findPaginated(opts: { search?: string; skip: number; take: number }) {
		const where = opts.search
			? {
					OR: [
						{ user: { name: { contains: opts.search, mode: "insensitive" as const } } },
						{ user: { email: { contains: opts.search, mode: "insensitive" as const } } },
						{ licenseNo: { contains: opts.search, mode: "insensitive" as const } },
					],
				}
			: {};
		const [items, total] = await Promise.all([
			prisma.driver.findMany({
				where,
				include: { user: { select: { id: true, email: true, name: true, role: true, active: true } } },
				orderBy: { createdAt: "desc" },
				skip: opts.skip,
				take: opts.take,
			}),
			prisma.driver.count({ where }),
		]);
		return { items, total, hasMore: opts.skip + opts.take < total };
	},

	async update(id: string, data: { licenseNo?: string; phone?: string }) {
		return prisma.driver.update({
			where: { id },
			data,
			include: { user: { select: { id: true, email: true, name: true, role: true } } },
		});
	},
};
