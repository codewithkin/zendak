import { AppError } from "../../lib/errors";
import { tripsRepository } from "../trips/trips.repository";
import type { CreateRevenueInput, UpdateRevenueInput } from "./revenue.schema";
import { revenueRepository } from "./revenue.repository";

export const revenueService = {
	async create(input: CreateRevenueInput) {
		const trip = await tripsRepository.findById(input.tripId);
		if (!trip) {
			throw AppError.badRequest("Trip not found");
		}

		if (trip.status !== "COMPLETED" && trip.status !== "SETTLED") {
			throw AppError.badRequest("Revenue can only be assigned to completed or settled trips");
		}

		const existing = await revenueRepository.findByTripId(input.tripId);
		if (existing) {
			throw AppError.conflict("Revenue already assigned to this trip");
		}

		return revenueRepository.create(input);
	},

	async findAll() {
		return revenueRepository.findAll();
	},

	async findById(id: string) {
		const revenue = await revenueRepository.findById(id);
		if (!revenue) {
			throw AppError.notFound("Revenue not found");
		}
		return revenue;
	},

	async update(id: string, input: UpdateRevenueInput) {
		const revenue = await revenueRepository.findById(id);
		if (!revenue) {
			throw AppError.notFound("Revenue not found");
		}

		const trip = await tripsRepository.findById(revenue.tripId);
		if (trip?.status === "SETTLED") {
			throw AppError.badRequest("Cannot modify revenue on a settled trip");
		}

		return revenueRepository.update(id, input);
	},
};
