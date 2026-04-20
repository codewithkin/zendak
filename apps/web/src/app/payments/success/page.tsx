"use client";

import {
	AlertCircleIcon,
	ArrowRight01Icon,
	CheckmarkCircle02Icon,
	Loading03Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@zendak/ui/components/button";
import { Icon } from "@zendak/ui/components/icon";

import { useMe } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-billing";

function SuccessPageContent() {
	const router = useRouter();
	const { user, isLoading: userLoading } = useMe();
	const { subscription, isLoading: subLoading } = useSubscription(
		user?.businessId ?? null,
	);
	const [pollCount, setPollCount] = useState(0);

	const isActive =
		subscription?.subscriptionStatus === "TRIAL" ||
		subscription?.subscriptionStatus === "ACTIVE";

	// Poll subscription status until webhook processes it
	useEffect(() => {
		if (isActive || pollCount > 20) return;

		const timer = setTimeout(() => {
			setPollCount((c) => c + 1);
		}, 2000);

		return () => clearTimeout(timer);
	}, [isActive, pollCount]);

	if (userLoading || subLoading || (!isActive && pollCount <= 20)) {
		return (
			<StatusLayout variant="loading">
				<Icon
					icon={Loading03Icon}
					size={32}
					className="animate-spin text-primary"
				/>
				<p className="text-sm text-muted-foreground">
					Activating your subscription...
				</p>
			</StatusLayout>
		);
	}

	if (!isActive) {
		return (
			<StatusLayout variant="error">
				<h2 className="text-lg font-semibold">Activation pending</h2>
				<p className="text-sm text-muted-foreground">
					Your payment was received but your plan is still being activated.
					This may take a moment — please refresh or contact support.
				</p>
				<Button
					variant="outline"
					onClick={() => router.push("/pricing")}
					className="mt-4"
				>
					Go to pricing
				</Button>
			</StatusLayout>
		);
	}

	return (
		<StatusLayout variant="success">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
				<Icon icon={CheckmarkCircle02Icon} size={28} className="text-green-600" />
			</div>

			<div className="space-y-1 text-center">
				<h2 className="text-xl font-semibold">
					Welcome to the {subscription?.plan?.label ?? "your"} plan
				</h2>
				<p className="text-sm text-muted-foreground">
					Your trial is now active. All features are unlocked — start
					managing your fleet.
				</p>
			</div>

			<Button onClick={() => router.push("/dashboard/admin")}>
				<Icon icon={ArrowRight01Icon} size={14} />
				Go to Dashboard
			</Button>
		</StatusLayout>
	);
}

export default function PaymentSuccessPage() {
	return (
		<Suspense
			fallback={
				<StatusLayout variant="loading">
					<Icon
						icon={Loading03Icon}
						size={32}
						className="animate-spin text-primary"
					/>
					<p className="text-sm text-muted-foreground">Loading...</p>
				</StatusLayout>
			}
		>
			<SuccessPageContent />
		</Suspense>
	);
}

function StatusLayout({
	variant,
	children,
}: {
	variant: "loading" | "success" | "error";
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
			<div className="flex max-w-md flex-col items-center gap-6 text-center">
				{variant === "error" && (
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
						<Icon icon={AlertCircleIcon} size={28} className="text-red-600" />
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
