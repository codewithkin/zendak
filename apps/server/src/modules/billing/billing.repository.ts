import prisma from "@zendak/db";
import type { PlanName, SubscriptionStatus } from "@zendak/plans";

export const billingRepository = {
	async createIntermediatePayment(data: {
		userId: string;
		businessId: string;
		planName: PlanName;
		amount: number;
	}) {
		return prisma.intermediatePayment.create({
			data: {
				userId: data.userId,
				businessId: data.businessId,
				planName: data.planName,
				amount: data.amount,
				paid: false,
				processed: false,
			},
		});
	},

	async findIntermediatePayment(id: string) {
		return prisma.intermediatePayment.findUnique({
			where: { id },
		});
	},

	async markPaymentPaid(id: string) {
		return prisma.intermediatePayment.update({
			where: { id },
			data: { paid: true },
		});
	},

	async markPaymentProcessed(id: string) {
		return prisma.intermediatePayment.update({
			where: { id },
			data: { processed: true },
		});
	},

	async activateBusinessPlan(businessId: string, planName: PlanName) {
		return prisma.business.update({
			where: { id: businessId },
			data: {
				plan: planName,
				subscriptionStatus: "ACTIVE",
				planActivatedAt: new Date(),
			},
		});
	},

	async updateBusinessPolarIds(
		businessId: string,
		data: { polarCustomerId?: string; polarSubscriptionId?: string },
	) {
		return prisma.business.update({
			where: { id: businessId },
			data,
		});
	},

	async updateBusinessSubscription(
		businessId: string,
		data: {
			plan?: PlanName;
			subscriptionStatus?: SubscriptionStatus;
			trialEndsAt?: Date | null;
			planActivatedAt?: Date | null;
			polarSubscriptionId?: string;
		},
	) {
		return prisma.business.update({
			where: { id: businessId },
			data,
		});
	},

	async findBusinessByPolarCustomerId(polarCustomerId: string) {
		return prisma.business.findFirst({
			where: { polarCustomerId },
		});
	},

	async findBusinessByPolarSubscriptionId(polarSubscriptionId: string) {
		return prisma.business.findFirst({
			where: { polarSubscriptionId },
		});
	},

	async getBusinessById(businessId: string) {
		return prisma.business.findUnique({
			where: { id: businessId },
		});
	},

	async getUserById(userId: string) {
		return prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, name: true },
		});
	},

	async getBusinessWithCounts(businessId: string) {
		const [business, truckCount, userCount] = await Promise.all([
			prisma.business.findUnique({ where: { id: businessId } }),
			prisma.truck.count(),
			prisma.user.count({ where: { businessId } }),
		]);
		return { business, truckCount, userCount };
	},

	async getMonthlyTripCount(businessId: string) {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const userIds = await prisma.user.findMany({
			where: { businessId },
			select: { id: true },
		});
		const driverIds = await prisma.driver.findMany({
			where: { userId: { in: userIds.map((u) => u.id) } },
			select: { id: true },
		});
		return prisma.trip.count({
			where: {
				driverId: { in: driverIds.map((d) => d.id) },
				createdAt: { gte: startOfMonth },
			},
		});
	},
};
