import { AppError } from "../../lib/errors";
import { tripsRepository } from "../trips/trips.repository";
import { trucksRepository } from "../trucks/trucks.repository";
import { profitRepository } from "./profit.repository";

export const profitService = {
	async tripProfit(tripId: string) {
		const trip = await tripsRepository.findById(tripId);
		if (!trip) {
			throw AppError.notFound("Trip not found");
		}

		const { revenue, expenses } = await profitRepository.getTripFinancials(tripId);
		const profit = revenue - expenses;

		return {
			tripId,
			origin: trip.origin,
			destination: trip.destination,
			status: trip.status,
			revenue,
			expenses,
			profit,
			margin: revenue > 0 ? (profit / revenue) * 100 : 0,
		};
	},

	async truckProfit(truckId: string) {
		const truck = await trucksRepository.findById(truckId);
		if (!truck) {
			throw AppError.notFound("Truck not found");
		}

		const trips = await profitRepository.getTruckTrips(truckId);

		let totalRevenue = 0;
		let totalExpenses = 0;
		const tripProfits = [];

		for (const trip of trips) {
			const { revenue, expenses } = await profitRepository.getTripFinancials(trip.id);
			totalRevenue += revenue;
			totalExpenses += expenses;
			tripProfits.push({ tripId: trip.id, revenue, expenses, profit: revenue - expenses });
		}

		const totalProfit = totalRevenue - totalExpenses;

		return {
			truckId,
			plateNumber: truck.plateNumber,
			model: truck.model,
			totalRevenue,
			totalExpenses,
			totalProfit,
			margin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
			tripCount: trips.length,
			trips: tripProfits,
		};
	},

	async summary(dateFrom?: string, dateTo?: string) {
		const from = dateFrom ? new Date(dateFrom) : undefined;
		const to = dateTo ? new Date(dateTo) : undefined;

		const data = await profitRepository.getSummaryData(from, to);
		const profit = data.totalRevenue - data.totalExpenses;

		return {
			totalRevenue: data.totalRevenue,
			totalExpenses: data.totalExpenses,
			totalProfit: profit,
			margin: data.totalRevenue > 0 ? (profit / data.totalRevenue) * 100 : 0,
			tripCount: data.tripCount,
			...(dateFrom && { dateFrom }),
			...(dateTo && { dateTo }),
		};
	},
};
