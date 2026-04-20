import { AppError } from "../../lib/errors";
import { generatePdfReport } from "./pdf-generator";
import { reportsRepository } from "./reports.repository";

interface ReportFilters {
	startDate?: string;
	endDate?: string;
	driverId?: string;
	truckId?: string;
}

export const reportsService = {
	async generateTripReport(businessId: string, filters: ReportFilters) {
		const companyName = await reportsRepository.getBusinessName(businessId);
		const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
		const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

		const trips = await reportsRepository.getTripReport({
			startDate,
			endDate,
			driverId: filters.driverId,
			truckId: filters.truckId,
		});

		if (trips.length === 0) {
			throw AppError.notFound("No trips found for the given filters");
		}

		let totalRevenue = 0;
		let totalExpenses = 0;

		const rows = trips.map((trip) => {
			const revenue = trip.revenue ? Number(trip.revenue.amount) : 0;
			const expenses = trip.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
			const profit = revenue - expenses;
			totalRevenue += revenue;
			totalExpenses += expenses;

			return [
				{ text: trip.id.slice(-8), width: 60 },
				{ text: `${trip.origin} > ${trip.destination}`, width: 120 },
				{ text: trip.truck.plateNumber, width: 70 },
				{ text: trip.driver.user.name, width: 80 },
				{ text: `$${revenue.toFixed(2)}`, width: 65 },
				{ text: `$${expenses.toFixed(2)}`, width: 65 },
				{ text: `$${profit.toFixed(2)}`, width: 65 },
			];
		});

		const totalProfit = totalRevenue - totalExpenses;
		const dateRange = formatDateRange(startDate, endDate);

		return generatePdfReport({
			companyName,
			title: "Trip Report",
			dateRange,
			generatedAt: new Date().toLocaleString(),
			summary: [
				{ label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
				{ label: "Total Expenses", value: `$${totalExpenses.toFixed(2)}` },
				{ label: "Total Profit", value: `$${totalProfit.toFixed(2)}` },
				{ label: "Total Trips", value: trips.length.toString() },
			],
			table: {
				headers: [
					{ text: "Trip ID", width: 60 },
					{ text: "Route", width: 120 },
					{ text: "Truck", width: 70 },
					{ text: "Driver", width: 80 },
					{ text: "Revenue", width: 65 },
					{ text: "Expenses", width: 65 },
					{ text: "Profit", width: 65 },
				],
				rows,
			},
		});
	},

	async generateFleetReport(businessId: string, filters: ReportFilters) {
		const companyName = await reportsRepository.getBusinessName(businessId);
		const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
		const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

		const trucks = await reportsRepository.getFleetReport({ startDate, endDate });

		if (trucks.length === 0) {
			throw AppError.notFound("No fleet data found for the given filters");
		}

		let totalRevenue = 0;
		let totalCost = 0;

		const rows = trucks.map((truck) => {
			const tripCount = truck.trips.length;
			let truckRevenue = 0;
			let truckCost = 0;

			for (const trip of truck.trips) {
				if (trip.revenue) truckRevenue += Number(trip.revenue.amount);
				truckCost += trip.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
			}

			const profit = truckRevenue - truckCost;
			totalRevenue += truckRevenue;
			totalCost += truckCost;

			return [
				{ text: truck.plateNumber, width: 90 },
				{ text: tripCount.toString(), width: 70 },
				{ text: `$${truckRevenue.toFixed(2)}`, width: 100 },
				{ text: `$${truckCost.toFixed(2)}`, width: 100 },
				{ text: `$${profit.toFixed(2)}`, width: 100 },
			];
		});

		const totalProfit = totalRevenue - totalCost;
		const dateRange = formatDateRange(startDate, endDate);

		return generatePdfReport({
			companyName,
			title: "Fleet Report",
			dateRange,
			generatedAt: new Date().toLocaleString(),
			summary: [
				{ label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
				{ label: "Total Cost", value: `$${totalCost.toFixed(2)}` },
				{ label: "Total Profit", value: `$${totalProfit.toFixed(2)}` },
				{ label: "Total Trucks", value: trucks.length.toString() },
			],
			table: {
				headers: [
					{ text: "Truck", width: 90 },
					{ text: "Total Trips", width: 70 },
					{ text: "Total Revenue", width: 100 },
					{ text: "Total Cost", width: 100 },
					{ text: "Profit", width: 100 },
				],
				rows,
			},
		});
	},

	async getOperatingCosts(businessId: string, filters: ReportFilters) {
		const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
		const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

		const expenses = await reportsRepository.getOperatingCosts({
			startDate,
			endDate,
			truckId: filters.truckId,
		});

		let totalCost = 0;
		const byTruck: Record<string, { plateNumber: string; model: string; total: number; count: number }> = {};

		for (const exp of expenses) {
			const amount = Number(exp.amount);
			totalCost += amount;

			if (exp.truck) {
				const key = exp.truck.id;
				if (!byTruck[key]) {
					byTruck[key] = { plateNumber: exp.truck.plateNumber, model: exp.truck.model, total: 0, count: 0 };
				}
				byTruck[key].total += amount;
				byTruck[key].count += 1;
			}
		}

		return {
			totalCost,
			expenseCount: expenses.length,
			byTruck: Object.entries(byTruck)
				.map(([id, data]) => ({ id, ...data }))
				.sort((a, b) => b.total - a.total),
			expenses: expenses.map((e) => ({
				id: e.id,
				amount: Number(e.amount),
				type: e.type,
				description: e.description,
				truck: e.truck,
				driver: e.driver,
				trip: e.trip,
				createdAt: e.createdAt,
			})),
		};
	},

	async getCategoricalSpending(businessId: string, filters: ReportFilters) {
		const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
		const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

		return reportsRepository.getCategoricalSpending({ startDate, endDate });
	},

	async generateOperatingCostsPdf(businessId: string, filters: ReportFilters) {
		const companyName = await reportsRepository.getBusinessName(businessId);
		const data = await this.getOperatingCosts(businessId, filters);
		const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
		const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
		const dateRange = formatDateRange(startDate, endDate);

		const rows = data.byTruck.map((t) => [
			{ text: t.plateNumber, width: 100 },
			{ text: t.model, width: 120 },
			{ text: t.count.toString(), width: 80 },
			{ text: `$${t.total.toFixed(2)}`, width: 100 },
		]);

		return generatePdfReport({
			companyName,
			title: "Operating Costs Report",
			dateRange,
			generatedAt: new Date().toLocaleString(),
			summary: [
				{ label: "Total Operating Cost", value: `$${data.totalCost.toFixed(2)}` },
				{ label: "Total Expenses", value: data.expenseCount.toString() },
				{ label: "Trucks with Costs", value: data.byTruck.length.toString() },
			],
			table: {
				headers: [
					{ text: "Truck", width: 100 },
					{ text: "Model", width: 120 },
					{ text: "Expenses", width: 80 },
					{ text: "Total Cost", width: 100 },
				],
				rows,
			},
		});
	},

	async generateCategoricalSpendingPdf(businessId: string, filters: ReportFilters) {
		const companyName = await reportsRepository.getBusinessName(businessId);
		const categories = await this.getCategoricalSpending(businessId, filters);
		const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
		const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
		const dateRange = formatDateRange(startDate, endDate);
		const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);

		const rows = categories.map((c) => [
			{ text: c.type, width: 120 },
			{ text: c.count.toString(), width: 80 },
			{ text: `$${c.total.toFixed(2)}`, width: 120 },
			{ text: `${c.percentage.toFixed(1)}%`, width: 80 },
		]);

		return generatePdfReport({
			companyName,
			title: "Categorical Spending Report",
			dateRange,
			generatedAt: new Date().toLocaleString(),
			summary: [
				{ label: "Total Spending", value: `$${grandTotal.toFixed(2)}` },
				{ label: "Categories", value: categories.length.toString() },
			],
			table: {
				headers: [
					{ text: "Category", width: 120 },
					{ text: "Count", width: 80 },
					{ text: "Total", width: 120 },
					{ text: "% of Total", width: 80 },
				],
				rows,
			},
		});
	},
};

function formatDateRange(start?: Date, end?: Date): string {
	if (start && end) {
		return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
	}
	if (start) return `From ${start.toLocaleDateString()}`;
	if (end) return `Until ${end.toLocaleDateString()}`;
	return "All time";
}
