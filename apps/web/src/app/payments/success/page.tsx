"use client";

import {
	AlertCircleIcon,
	ArrowRight01Icon,
	CheckmarkCircle02Icon,
	Loading03Icon,
	Settings01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
import { Icon } from "@zendak/ui/components/icon";

import {
	useActivatePlan,
	useMarkPaymentPaid,
	usePaymentStatus,
} from "@/hooks/use-billing";

function SuccessPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const paymentId = searchParams.get("intermediatePayment");

	const { payment, isLoading, error } = usePaymentStatus(paymentId);
	const { markPaid, isLoading: markingPaid } = useMarkPaymentPaid();
	const { activatePlan, isLoading: activating } = useActivatePlan();
	const [activated, setActivated] = useState(false);
	const [activationError, setActivationError] = useState<string | null>(null);

	// Auto-mark as paid and activate when landing on the success page
	useEffect(() => {
		if (!payment || activated || activating) return;

		async function processPayment() {
			if (!payment) return;

			try {
				// If not paid yet, mark as paid (simulating Polar webhook)
				if (!payment.paid) {
					await markPaid(payment.id);
				}

				// If not processed yet, activate the plan
				if (!payment.processed) {
					await activatePlan(payment.id);
				}

				setActivated(true);
			} catch (err) {
				setActivationError(
					err instanceof Error ? err.message : "Failed to activate plan",
				);
			}
		}

		processPayment();
	}, [payment, activated, activating, markPaid, activatePlan]);

	// ── Error states ──
	if (!paymentId) {
		return (
			<StatusLayout variant="error">
				<h2 className="text-lg font-semibold">Invalid payment reference</h2>
				<p className="text-sm text-muted-foreground">
					No payment ID was provided. Please try the checkout process again.
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

	if (error) {
		return (
			<StatusLayout variant="error">
				<h2 className="text-lg font-semibold">Payment not found</h2>
				<p className="text-sm text-muted-foreground">
					The payment record could not be found. It may have been removed or the ID
					is incorrect.
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

	if (isLoading || !payment) {
		return (
			<StatusLayout variant="loading">
				<Icon
					icon={Loading03Icon}
					size={32}
					className="animate-spin text-primary"
				/>
				<p className="text-sm text-muted-foreground">Verifying payment...</p>
			</StatusLayout>
		);
	}

	if (activationError) {
		return (
			<StatusLayout variant="error">
				<h2 className="text-lg font-semibold">Activation failed</h2>
				<p className="text-sm text-muted-foreground">{activationError}</p>
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

	if (activating || markingPaid || !activated) {
		return (
			<StatusLayout variant="loading">
				<Icon
					icon={Loading03Icon}
					size={32}
					className="animate-spin text-primary"
				/>
				<p className="text-sm text-muted-foreground">
					Activating your {payment.plan.label} plan...
				</p>
			</StatusLayout>
		);
	}

	// ── Success state ──
	return (
		<StatusLayout variant="success">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
				<Icon icon={CheckmarkCircle02Icon} size={28} className="text-green-600" />
			</div>

			<div className="space-y-1 text-center">
				<h2 className="text-xl font-semibold">
					Thank you for subscribing to the {payment.plan.label} plan
				</h2>
				<p className="text-sm text-muted-foreground">
					Your subscription is now active. All features and limits of the{" "}
					{payment.plan.label} plan are unlocked.
				</p>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row">
				<Button onClick={() => router.push("/dashboard/admin")}>
					<Icon icon={ArrowRight01Icon} size={14} />
					Go to Dashboard
				</Button>
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/admin")}
				>
					<Icon icon={Settings01Icon} size={14} />
					Go to Settings
				</Button>
			</div>
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
