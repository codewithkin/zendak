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
};
