import prisma from "@zendak/db";

export const uploadsRepository = {
	async getStorageUsed(businessId: string): Promise<bigint> {
		const business = await prisma.business.findUnique({
			where: { id: businessId },
			select: { storageUsedBytes: true },
		});
		return business?.storageUsedBytes ?? 0n;
	},

	async incrementStorage(businessId: string, bytes: bigint): Promise<void> {
		await prisma.business.update({
			where: { id: businessId },
			data: { storageUsedBytes: { increment: bytes } },
		});
	},

	async decrementStorage(businessId: string, bytes: bigint): Promise<void> {
		await prisma.business.update({
			where: { id: businessId },
			data: { storageUsedBytes: { decrement: bytes } },
		});
	},
};
