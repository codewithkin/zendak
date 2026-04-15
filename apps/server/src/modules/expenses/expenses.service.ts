import { AppError } from "../../lib/errors";
import type { AuthUser } from "../../types";
import { tripsRepository } from "../trips/trips.repository";
import type { CreateExpenseInput, UpdateExpenseInput } from "./expenses.schema";
import { expensesRepository } from "./expenses.repository";

export const expensesService = {
	async create(input: CreateExpenseInput, user: AuthUser) {
		if (input.tripId) {
			const trip = await tripsRepository.findById(input.tripId);
			if (!trip) {
				throw AppError.badRequest("Trip not found");
			}
			if (trip.status === "SETTLED") {
				throw AppError.badRequest("Cannot add expenses to a settled trip");
			}

			if (user.role === "DRIVER") {
				const driver = await tripsRepository.findDriverByUserId(user.id);
				if (!driver || trip.driverId !== driver.id) {
					throw AppError.forbidden("You can only add expenses to your own trips");
				}
			}
		}

		return expensesRepository.create({
			amount: input.amount,
			type: input.type,
			description: input.description,
			tripId: input.tripId,
			truckId: input.truckId,
			driverId: input.driverId,
		});
	},

	async findAll(filters?: { tripId?: string; truckId?: string; type?: string }) {
		return expensesRepository.findAll(filters as Parameters<typeof expensesRepository.findAll>[0]);
	},

	async findById(id: string) {
		const expense = await expensesRepository.findById(id);
		if (!expense) {
			throw AppError.notFound("Expense not found");
		}
		return expense;
	},

	async update(id: string, input: UpdateExpenseInput) {
		const expense = await expensesRepository.findById(id);
		if (!expense) {
			throw AppError.notFound("Expense not found");
		}

		if (expense.tripId) {
			const trip = await tripsRepository.findById(expense.tripId);
			if (trip?.status === "SETTLED") {
				throw AppError.badRequest("Cannot modify expenses on a settled trip");
			}
		}

		return expensesRepository.update(id, input);
	},

	async delete(id: string) {
		const expense = await expensesRepository.findById(id);
		if (!expense) {
			throw AppError.notFound("Expense not found");
		}

		if (expense.tripId) {
			const trip = await tripsRepository.findById(expense.tripId);
			if (trip?.status === "SETTLED") {
				throw AppError.badRequest("Cannot delete expenses on a settled trip");
			}
		}

		return expensesRepository.delete(id);
	},
};
