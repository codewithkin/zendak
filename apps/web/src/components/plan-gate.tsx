"use client";

import { ArrowRight01Icon, LockIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import type { Feature } from "@zendak/plans";

import { Button } from "@zendak/ui/components/button";
import { Icon } from "@zendak/ui/components/icon";

import { usePlan } from "@/hooks/use-plan";
import { useMe } from "@/hooks/use-auth";

/**
 * Wraps content that requires a specific plan feature.
 * Shows upgrade prompt if the current plan does not include the feature.
 */
export function PlanGate({
	feature,
	children,
	fallback,
}: {
	feature: Feature;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) {
	const { user } = useMe();
	const { canUseFeature, isLoading } = usePlan(user?.businessId);

	if (isLoading) return <>{children}</>;

	if (!canUseFeature(feature)) {
		return fallback ?? <UpgradePrompt feature={feature} />;
	}

	return <>{children}</>;
}

/**
 * Shows an inline upgrade prompt when a feature is not available.
 */
export function UpgradePrompt({
	feature,
	message,
}: {
	feature?: Feature;
	message?: string;
}) {
	const router = useRouter();

	const displayMessage =
		message ??
		(feature
			? `The "${feature.replace(/_/g, " ")}" feature requires a higher plan.`
			: "This feature requires a plan upgrade.");

	return (
		<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-6 text-center">
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
				<Icon icon={LockIcon} size={18} className="text-amber-600" />
			</div>
			<p className="text-sm text-muted-foreground">{displayMessage}</p>
			<Button
				size="sm"
				variant="outline"
				onClick={() => router.push("/pricing")}
			>
				Upgrade plan
				<Icon icon={ArrowRight01Icon} size={12} />
			</Button>
		</div>
	);
}

/**
 * Shows a limit warning banner when approaching or at a resource limit.
 */
export function LimitWarning({
	resource,
	current,
	limit,
}: {
	resource: string;
	current: number;
	limit: number;
}) {
	const router = useRouter();

	if (limit === Infinity) return null;

	const percentage = (current / limit) * 100;
	if (percentage < 80) return null;

	const isAtLimit = current >= limit;

	return (
		<div
			className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
				isAtLimit
					? "border-red-200 bg-red-50"
					: "border-amber-200 bg-amber-50"
			}`}
		>
			<p className="text-xs">
				{isAtLimit ? (
					<span className="font-medium text-red-800">
						You&apos;ve reached your limit of {limit} {resource}.
					</span>
				) : (
					<span className="font-medium text-amber-800">
						You&apos;re using {current} of {limit} {resource}.
					</span>
				)}
			</p>
			<Button
				size="sm"
				variant="ghost"
				className="h-auto py-1 text-xs"
				onClick={() => router.push("/pricing")}
			>
				Upgrade
				<Icon icon={ArrowRight01Icon} size={10} />
			</Button>
		</div>
	);
}

/**
 * Trial countdown banner. Shows in the dashboard when on trial.
 */
export function TrialBanner() {
	const { user } = useMe();
	const { businessPlan, trialDaysLeft, isTrialExpired } = usePlan(
		user?.businessId,
	);
	const router = useRouter();

	if (!businessPlan) return null;
	if (businessPlan.subscriptionStatus !== "TRIAL") return null;

	if (isTrialExpired) {
		return (
			<div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
				<div>
					<p className="text-sm font-medium text-red-800">
						Your trial has expired
					</p>
					<p className="text-xs text-red-600">
						Subscribe to a plan to continue creating trucks, drivers, and trips.
					</p>
				</div>
				<Button size="sm" onClick={() => router.push("/pricing")}>
					Choose a plan
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
			<div>
				<p className="text-sm font-medium text-amber-800">
					Trial: {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining
				</p>
				<p className="text-xs text-amber-600">
					Subscribe to a plan to unlock all features without interruption.
				</p>
			</div>
			<Button
				size="sm"
				variant="outline"
				onClick={() => router.push("/pricing")}
			>
				View plans
			</Button>
		</div>
	);
}
