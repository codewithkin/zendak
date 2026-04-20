"use client";

import { DeliveryTruck02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Icon } from "@zendak/ui/components/icon";

import { useMe } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-billing";

const ROLE_ROUTES = {
  ADMIN: "/dashboard/admin",
  ACCOUNTANT: "/dashboard/finance",
  OPERATIONS: "/dashboard/ops",
  DRIVER: "/dashboard/driver",
} as const;

type Role = keyof typeof ROLE_ROUTES;

export default function Loading() {
  const router = useRouter();
  const { user, isLoading, error } = useMe();
  const { subscription, isLoading: subLoading } = useSubscription(
    user?.businessId ?? null,
  );

  useEffect(() => {
    if (isLoading || subLoading) return;

    if (error || !user) {
      router.replace("/sign-in" as never);
      return;
    }

    if (user.role === "ADMIN" && !user.onboardedAt) {
      router.replace("/onboarding" as never);
      return;
    }

    // Check subscription for admin users
    if (user.role === "ADMIN") {
      const hasActiveSub =
        subscription?.subscriptionStatus === "TRIAL" ||
        subscription?.subscriptionStatus === "ACTIVE";
      const isTrialValid =
        subscription?.subscriptionStatus === "TRIAL" &&
        subscription?.trialEndsAt &&
        new Date(subscription.trialEndsAt) > new Date();

      if (!hasActiveSub || (subscription?.subscriptionStatus === "TRIAL" && !isTrialValid)) {
        router.replace("/pricing" as never);
        return;
      }
    }

    const route = ROLE_ROUTES[user.role as Role];
    if (route) {
      router.replace(route as never);
    }
  }, [user, isLoading, error, router, subscription, subLoading]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon icon={DeliveryTruck02Icon} size={22} />
          </div>
          <div className="space-y-0.5">
            <span className="block text-sm font-semibold tracking-tight text-foreground">Zendak</span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Logistics business platform
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-primary"
        >
          <Icon icon={Loading03Icon} size={24} className="animate-spin" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="space-y-1 text-center"
        >
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Authenticating
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Routing you back into your Zendak workspace for fleet, trip, and finance control.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
