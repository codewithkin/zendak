import type { Context } from "hono";

import { AppError } from "../../lib/errors";
import type { AuthEnv } from "../../types";
import { createExpenseSchema, updateExpenseSchema } from "./expenses.schema";
import { expensesService } from "./expenses.service";

export const expensesController = {
	async create(c: Context<AuthEnv>) {
		const body = await c.req.json();
		const parsed = createExpenseSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const user = c.get("user");
		const expense = await expensesService.create(parsed.data, user);
		return c.json(expense, 201);
	},

	async findAll(c: Context<AuthEnv>) {
		const tripId = c.req.query("tripId");
		const truckId = c.req.query("truckId");
		const type = c.req.query("type");
		const expenses = await expensesService.findAll({ tripId, truckId, type });
		return c.json(expenses);
	},

	async findById(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const expense = await expensesService.findById(id);
		return c.json(expense);
	},

	async update(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		const body = await c.req.json();
		const parsed = updateExpenseSchema.safeParse(body);
		if (!parsed.success) {
			throw AppError.badRequest(parsed.error.issues[0].message);
		}
		const expense = await expensesService.update(id, parsed.data);
		return c.json(expense);
	},

	async delete(c: Context<AuthEnv>) {
		const id = c.req.param("id");
		await expensesService.delete(id);
		return c.json({ message: "Expense deleted" });
	},
};
