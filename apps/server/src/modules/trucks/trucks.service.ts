import { AppError } from "../../lib/errors";
import type { CreateTruckInput, UpdateTruckInput } from "./trucks.schema";
import { trucksRepository } from "./trucks.repository";

export const trucksService = {
	async create(input: CreateTruckInput) {
		const existing = await trucksRepository.findByPlateNumber(input.plateNumber);
		if (existing) {
			throw AppError.conflict("Truck with this plate number already exists");
		}
		return trucksRepository.create(input);
	},

	async findAll() {
		return trucksRepository.findAll();
	},

	async findById(id: string) {
		const truck = await trucksRepository.findById(id);
		if (!truck) {
			throw AppError.notFound("Truck not found");
		}
		return truck;
	},

	async update(id: string, input: UpdateTruckInput) {
		const truck = await trucksRepository.findById(id);
		if (!truck) {
			throw AppError.notFound("Truck not found");
		}

		if (input.status === "RETIRED") {
			const hasActive = await trucksRepository.hasActiveTrips(id);
			if (hasActive) {
				throw AppError.badRequest("Cannot retire a truck with active trips");
			}
		}

		return trucksRepository.update(id, input);
	},

	async retire(id: string) {
		const truck = await trucksRepository.findById(id);
		if (!truck) {
			throw AppError.notFound("Truck not found");
		}

		const hasActive = await trucksRepository.hasActiveTrips(id);
		if (hasActive) {
			throw AppError.badRequest("Cannot retire a truck with active trips");
		}

		return trucksRepository.updateStatus(id, "RETIRED");
	},

	async search(q: string, page: number, limit: number, status?: string) {
		const take = Math.min(limit, 50);
		const skip = (page - 1) * take;
		const validStatuses = ["AVAILABLE", "IN_TRANSIT", "MAINTENANCE", "RETIRED"];
		const truckStatus = status && validStatuses.includes(status) ? (status as "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE" | "RETIRED") : undefined;
		return trucksRepository.findPaginated({ search: q || undefined, skip, take, status: truckStatus });
	},

	async getDetail(id: string) {
		const truck = await trucksRepository.getDetailById(id);
		if (!truck) throw AppError.notFound("Truck not found");

		const totalExpenses = truck.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
		const totalRevenue = truck.trips.reduce((sum, t) => sum + (t.revenue ? Number(t.revenue.amount) : 0), 0);
		const totalTrips = truck.trips.length;

		// Driver history: unique drivers who have driven this truck
		const driverMap = new Map<string, { id: string; name: string; tripCount: number; lastTrip: string }>();
		for (const trip of truck.trips) {
			const d = driverMap.get(trip.driverId);
			if (d) {
				d.tripCount += 1;
				if (trip.createdAt.toISOString() > d.lastTrip) d.lastTrip = trip.createdAt.toISOString();
			} else {
				driverMap.set(trip.driverId, {
					id: trip.driverId,
					name: trip.driver.user.name,
					tripCount: 1,
					lastTrip: trip.createdAt.toISOString(),
				});
			}
		}

		const upcomingReminders = truck.serviceReminders.filter((r) => !r.completed);

		return {
			...truck,
			summary: {
				totalExpenses,
				totalRevenue,
				totalProfit: totalRevenue - totalExpenses,
				totalTrips,
			},
			driverHistory: Array.from(driverMap.values()).sort((a, b) => b.tripCount - a.tripCount),
			upcomingReminders,
		};
	},
};
