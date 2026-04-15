import type { Context } from "hono";

import { profitService } from "./profit.service";

export const profitController = {
	async tripProfit(c: Context) {
		const tripId = c.req.param("tripId");
		const result = await profitService.tripProfit(tripId);
		return c.json(result);
	},

	async truckProfit(c: Context) {
		const truckId = c.req.param("truckId");
		const result = await profitService.truckProfit(truckId);
		return c.json(result);
	},

	async summary(c: Context) {
		const dateFrom = c.req.query("dateFrom");
		const dateTo = c.req.query("dateTo");
		const result = await profitService.summary(dateFrom, dateTo);
		return c.json(result);
	},
};
