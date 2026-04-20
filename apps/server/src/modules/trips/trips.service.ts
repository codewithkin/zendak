import { AppError } from "../../lib/errors";
import type { AuthUser } from "../../types";
import { driversRepository } from "../drivers/drivers.repository";
import { notificationsService } from "../notifications/notifications.service";
import { trucksRepository } from "../trucks/trucks.repository";
import type { CreateTripInput, UpdateTripInput } from "./trips.schema";
import { tripsRepository } from "./trips.repository";

export const tripsService = {
	async create(input: CreateTripInput) {
		const driver = await driversRepository.findById(input.driverId);
		if (!driver) {
			throw AppError.badRequest("Driver not found");
		}

		const truck = await trucksRepository.findById(input.truckId);
		if (!truck) {
			throw AppError.badRequest("Truck not found");
		}

		if (truck.status !== "AVAILABLE") {
			throw AppError.badRequest(`Truck is not available (current status: ${truck.status})`);
		}

		const trip = await tripsRepository.create(input);

		// Fire-and-forget: notify driver + admins
		tripsRepository.getDriverNotificationInfo(input.driverId).then((userInfo) => {
			if (!userInfo) return;
			notificationsService.notifyUser({
				userId: userInfo.id,
				title: "New Trip Assigned",
				message: `Trip from ${input.origin} to ${input.destination}`,
				type: "TRIP_ASSIGNED",
				metadata: { tripId: trip.id },
			});
			if (userInfo.businessId) {
				notificationsService.notifyByRole({
					businessId: userInfo.businessId,
					roles: ["ADMIN", "OPERATIONS"],
					title: "New Trip Created",
					message: `${userInfo.name} assigned: ${input.origin} → ${input.destination}`,
					type: "TRIP_CREATED",
					metadata: { tripId: trip.id },
				});
			}
		}).catch(() => {});

		return trip;
	},

	async findAll(user: AuthUser) {
		if (user.role === "DRIVER") {
			const driver = await tripsRepository.findDriverByUserId(user.id);
			if (!driver) {
				throw AppError.notFound("Driver profile not found");
			}
			return tripsRepository.findAll({ driverId: driver.id });
		}
		return tripsRepository.findAll();
	},

	async findById(id: string, user: AuthUser) {
		const trip = await tripsRepository.findById(id);
		if (!trip) {
			throw AppError.notFound("Trip not found");
		}

		if (user.role === "DRIVER") {
			const driver = await tripsRepository.findDriverByUserId(user.id);
			if (!driver || trip.driverId !== driver.id) {
				throw AppError.forbidden("You can only view your own trips");
			}
		}

		return trip;
	},

	async update(id: string, input: UpdateTripInput) {
		const trip = await tripsRepository.findById(id);
		if (!trip) {
			throw AppError.notFound("Trip not found");
		}

		if (trip.status !== "PLANNED") {
			throw AppError.badRequest("Can only update trips in PLANNED status");
		}

		return tripsRepository.update(id, input);
	},

	async start(id: string) {
		const trip = await tripsRepository.findById(id);
		if (!trip) {
			throw AppError.notFound("Trip not found");
		}

		if (trip.status !== "PLANNED") {
			throw AppError.badRequest(`Cannot start trip (current status: ${trip.status})`);
		}

		const truck = await trucksRepository.findById(trip.truckId);
		if (!truck || truck.status !== "AVAILABLE") {
			throw AppError.badRequest("Truck is not available");
		}

		await trucksRepository.updateStatus(trip.truckId, "IN_TRANSIT");

		const startedTrip = await tripsRepository.updateStatus(id, "ACTIVE", { startedAt: new Date() });

		// Fire-and-forget: notify admins that trip started
		tripsRepository.getDriverNotificationInfo(trip.driverId).then((userInfo) => {
			if (!userInfo?.businessId) return;
			notificationsService.notifyByRole({
				businessId: userInfo.businessId,
				roles: ["ADMIN", "OPERATIONS"],
				title: "Trip Started",
				message: `${userInfo.name} started trip: ${trip.origin} → ${trip.destination}`,
				type: "TRIP_STARTED",
				metadata: { tripId: id },
			});
		}).catch(() => {});

		return startedTrip;
	},

	async complete(id: string) {
		const trip = await tripsRepository.findById(id);
		if (!trip) {
			throw AppError.notFound("Trip not found");
		}

		if (trip.status !== "ACTIVE") {
			throw AppError.badRequest(`Cannot complete trip (current status: ${trip.status})`);
		}

		await trucksRepository.updateStatus(trip.truckId, "AVAILABLE");

		const completedTrip = await tripsRepository.updateStatus(id, "COMPLETED", { completedAt: new Date() });

		// Fire-and-forget: notify admins + accountants
		tripsRepository.getDriverNotificationInfo(trip.driverId).then((userInfo) => {
			if (!userInfo?.businessId) return;
			notificationsService.notifyByRole({
				businessId: userInfo.businessId,
				roles: ["ADMIN", "ACCOUNTANT"],
				title: "Trip Completed",
				message: `${userInfo.name} completed trip: ${trip.origin} → ${trip.destination}`,
				type: "TRIP_COMPLETED",
				metadata: { tripId: id },
			});
		}).catch(() => {});

		return completedTrip;
	},

	async settle(id: string) {
		const trip = await tripsRepository.findById(id);
		if (!trip) {
			throw AppError.notFound("Trip not found");
		}

		if (trip.status !== "COMPLETED") {
			throw AppError.badRequest(`Cannot settle trip (current status: ${trip.status})`);
		}

		const hasRevenue = await tripsRepository.hasRevenue(id);
		if (!hasRevenue) {
			throw AppError.badRequest("Cannot settle trip without revenue assigned");
		}

		return tripsRepository.updateStatus(id, "SETTLED");
	},
	async search(q: string, page: number, limit: number) {
		const take = Math.min(limit, 50);
		const skip = (page - 1) * take;
		return tripsRepository.findPaginated({ search: q || undefined, skip, take });
	},
};
