"use client";

import {
	ArrowRight01Icon,
	CheckmarkCircle02Icon,
	CrownIcon,
	DeliveryTruck02Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
import { Icon } from "@zendak/ui/components/icon";
import {
	PLANS,
	type PlanName,
	type PlanDefinition,
	formatLimit,
} from "@zendak/plans";

import { useMe } from "@/hooks/use-auth";
import { useCreateCheckout, useSubscription } from "@/hooks/use-billing";

const PLAN_ORDER: PlanName[] = ["FOUNDATION", "CONTROL", "COMMAND", "ENTERPRISE"];

const PLAN_CTA: Record<PlanName, string> = {
	FOUNDATION: "Start Foundation",
	CONTROL: "Upgrade to Control",
	COMMAND: "Go Command",
	ENTERPRISE: "Unlock Enterprise",
};

export default function PricingPage() {
	const router = useRouter();
	const { user, isLoading: userLoading } = useMe();
	const { subscription, isLoading: subLoading } = useSubscription(
		user?.businessId ?? null,
	);
	const { createCheckout, isLoading: checkoutLoading } = useCreateCheckout();

	async function handleSelectPlan(planName: PlanName) {
		if (!user?.businessId) {
			toast.error("Please complete onboarding first.");
			return;
		}

		try {
			const result = await createCheckout(planName, user.businessId);
			// For now, simulate payment by marking paid and redirecting
			// In production, redirect to Polar checkout URL
			router.push(
				`/payments/success?intermediatePayment=${result.paymentId}`,
			);
		} catch {
			toast.error("Failed to start checkout. Please try again.");
		}
	}

	const currentPlan = subscription?.planName;
	const isTrialling =
		subscription?.subscriptionStatus === "TRIAL" && !subscription.isTrialExpired;
	const trialDaysLeft = subscription?.trialEndsAt
		? Math.max(
				0,
				Math.ceil(
					(new Date(subscription.trialEndsAt).getTime() - Date.now()) /
						(1000 * 60 * 60 * 24),
				),
			)
		: 0;

	if (userLoading || subLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b bg-background">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-2">
						<div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
							<span className="text-xs font-bold text-primary-foreground">Z</span>
						</div>
						<span className="text-sm font-semibold">Zendak</span>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push("/dashboard/admin")}
					>
						Back to dashboard
					</Button>
				</div>
			</div>

			<div className="mx-auto max-w-6xl px-6 py-16">
				{/* Title */}
				<div className="mb-12 text-center">
					<h1 className="text-3xl font-bold tracking-tight">Choose your plan</h1>
					<p className="mt-3 text-sm text-muted-foreground">
						Scale your logistics operations with the right level of control.
					</p>

					{isTrialling && (
						<div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800">
							Trial: {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining
						</div>
					)}
				</div>

				{/* Plan Cards */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{PLAN_ORDER.map((planName) => {
						const plan = PLANS[planName];
						const isCurrent = currentPlan === planName;
						const isPopular = plan.popular;

						return (
							<PlanCard
								key={planName}
								plan={plan}
								isCurrent={isCurrent}
								isPopular={isPopular}
								ctaLabel={PLAN_CTA[planName]}
								isLoading={checkoutLoading}
								onSelect={() => handleSelectPlan(planName)}
							/>
						);
					})}
				</div>

				{/* Bottom note */}
				<p className="mt-12 text-center text-xs text-muted-foreground">
					All plans include core fleet, driver, and trip management. Upgrade or
					downgrade at any time.
				</p>
			</div>
		</div>
	);
}

function PlanCard({
	plan,
	isCurrent,
	isPopular,
	ctaLabel,
	isLoading,
	onSelect,
}: {
	plan: PlanDefinition;
	isCurrent: boolean;
	isPopular?: boolean;
	ctaLabel: string;
	isLoading: boolean;
	onSelect: () => void;
}) {
	const features = plan.features
		.map((f) => f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
		.slice(0, 8);

	return (
		<div
			className={`relative flex flex-col rounded-xl border p-6 ${
				isPopular
					? "border-primary bg-primary/[0.02] shadow-sm"
					: "border-border bg-background"
			}`}
		>
			{isPopular && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2">
					<span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
						<Icon icon={CrownIcon} size={10} />
						Most popular
					</span>
				</div>
			)}

			{/* Plan header */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold">{plan.label}</h3>
				<p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
				<div className="mt-4 flex items-baseline gap-1">
					<span className="text-3xl font-bold">${plan.price}</span>
					<span className="text-sm text-muted-foreground">/month</span>
				</div>
			</div>

			{/* Limits */}
			<div className="mb-6 space-y-2 rounded-lg bg-muted/50 p-3">
				<LimitRow label="Trucks" value={formatLimit(plan.limits.maxTrucks)} />
				<LimitRow label="Users" value={formatLimit(plan.limits.maxUsers)} />
				<LimitRow
					label="Trips/month"
					value={formatLimit(plan.limits.maxTripsPerMonth)}
				/>
			</div>

			{/* Features */}
			<div className="mb-6 flex-1 space-y-2">
				{features.map((feature) => (
					<div key={feature} className="flex items-start gap-2">
						<Icon
							icon={CheckmarkCircle02Icon}
							size={14}
							className="mt-0.5 shrink-0 text-green-600"
						/>
						<span className="text-xs text-muted-foreground">{feature}</span>
					</div>
				))}
				{plan.features.length > 8 && (
					<p className="text-[10px] text-muted-foreground">
						+{plan.features.length - 8} more features
					</p>
				)}
			</div>

			{/* CTA */}
			<Button
				className="w-full"
				variant={isPopular ? "default" : "outline"}
				disabled={isCurrent || isLoading}
				onClick={onSelect}
			>
				{isCurrent ? (
					"Current plan"
				) : (
					<>
						{ctaLabel}
						<Icon icon={ArrowRight01Icon} size={14} />
					</>
				)}
			</Button>
		</div>
	);
}

function LimitRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between text-xs">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium">{value}</span>
		</div>
	);
}
