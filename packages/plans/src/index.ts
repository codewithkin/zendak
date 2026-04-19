// ─── Plan Names ─────────────────────────────────────────

export const PLAN_NAMES = ["FOUNDATION", "CONTROL", "COMMAND", "ENTERPRISE"] as const;
export type PlanName = (typeof PLAN_NAMES)[number];

// ─── Subscription Status ────────────────────────────────

export const SUBSCRIPTION_STATUSES = ["TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// ─── Feature Flags ──────────────────────────────────────

export type Feature =
	| "fleet_management"
	| "driver_management"
	| "trip_tracking"
	| "basic_expense_logging"
	| "basic_pdf_reports"
	| "revenue_tracking"
	| "profit_per_trip"
	| "advanced_reports"
	| "filtered_pdf_reports"
	| "full_rbac"
	| "profit_per_truck"
	| "profit_over_time"
	| "client_management"
	| "invoice_generation"
	| "document_management"
	| "audit_logs"
	| "advanced_analytics"
	| "multi_branch"
	| "scheduled_reports"
	| "custom_roles"
	| "priority_support";

// ─── Plan Limits ────────────────────────────────────────

export interface PlanLimits {
	maxTrucks: number;
	maxUsers: number;
	maxTripsPerMonth: number;
}

// ─── Plan Definition ────────────────────────────────────

export interface PlanDefinition {
	name: PlanName;
	label: string;
	description: string;
	price: number;
	popular?: boolean;
	limits: PlanLimits;
	features: Feature[];
}

// ─── Trial Configuration ────────────────────────────────

export const TRIAL_DAYS = 3;

// ─── Plan Definitions (Source of Truth) ─────────────────

export const PLANS: Record<PlanName, PlanDefinition> = {
	FOUNDATION: {
		name: "FOUNDATION",
		label: "Foundation",
		description: "Essential fleet management for small operations",
		price: 49,
		limits: {
			maxTrucks: 3,
			maxUsers: 3,
			maxTripsPerMonth: 50,
		},
		features: [
			"fleet_management",
			"driver_management",
			"trip_tracking",
			"basic_expense_logging",
			"basic_pdf_reports",
		],
	},
	CONTROL: {
		name: "CONTROL",
		label: "Control",
		description: "Full visibility and financial control for growing fleets",
		price: 149,
		popular: true,
		limits: {
			maxTrucks: 15,
			maxUsers: 10,
			maxTripsPerMonth: 300,
		},
		features: [
			"fleet_management",
			"driver_management",
			"trip_tracking",
			"basic_expense_logging",
			"basic_pdf_reports",
			"revenue_tracking",
			"profit_per_trip",
			"advanced_reports",
			"filtered_pdf_reports",
			"full_rbac",
		],
	},
	COMMAND: {
		name: "COMMAND",
		label: "Command",
		description: "Complete operations management for established businesses",
		price: 499,
		limits: {
			maxTrucks: 50,
			maxUsers: 25,
			maxTripsPerMonth: 1000,
		},
		features: [
			"fleet_management",
			"driver_management",
			"trip_tracking",
			"basic_expense_logging",
			"basic_pdf_reports",
			"revenue_tracking",
			"profit_per_trip",
			"advanced_reports",
			"filtered_pdf_reports",
			"full_rbac",
			"profit_per_truck",
			"profit_over_time",
			"client_management",
			"invoice_generation",
			"document_management",
			"audit_logs",
		],
	},
	ENTERPRISE: {
		name: "ENTERPRISE",
		label: "Enterprise",
		description: "Unlimited scale with advanced analytics and support",
		price: 999,
		limits: {
			maxTrucks: Infinity,
			maxUsers: Infinity,
			maxTripsPerMonth: Infinity,
		},
		features: [
			"fleet_management",
			"driver_management",
			"trip_tracking",
			"basic_expense_logging",
			"basic_pdf_reports",
			"revenue_tracking",
			"profit_per_trip",
			"advanced_reports",
			"filtered_pdf_reports",
			"full_rbac",
			"profit_per_truck",
			"profit_over_time",
			"client_management",
			"invoice_generation",
			"document_management",
			"audit_logs",
			"advanced_analytics",
			"multi_branch",
			"scheduled_reports",
			"custom_roles",
			"priority_support",
		],
	},
};

// ─── Helper Functions ───────────────────────────────────

export function getPlan(name: PlanName): PlanDefinition {
	return PLANS[name];
}

export function hasFeature(planName: PlanName, feature: Feature): boolean {
	return PLANS[planName].features.includes(feature);
}

export function getLimits(planName: PlanName): PlanLimits {
	return PLANS[planName].limits;
}

export function isWithinLimit(
	planName: PlanName,
	resource: keyof PlanLimits,
	currentCount: number,
): boolean {
	const limit = PLANS[planName].limits[resource];
	if (limit === Infinity) return true;
	return currentCount < limit;
}

export function getUpgradePlan(currentPlan: PlanName): PlanName | null {
	const index = PLAN_NAMES.indexOf(currentPlan);
	if (index === PLAN_NAMES.length - 1) return null;
	return PLAN_NAMES[index + 1];
}

/** Human-readable limit label */
export function formatLimit(value: number): string {
	return value === Infinity ? "Unlimited" : value.toString();
}
