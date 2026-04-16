"use client";

import { DeliveryTruck02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Icon } from "@zendak/ui/components/icon";

import { useMe } from "@/hooks/use-auth";

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

  useEffect(() => {
    if (isLoading) return;

    if (error || !user) {
      router.replace("/sign-in" as never);
      return;
    }

    if (user.role === "ADMIN" && !user.onboardedAt) {
      router.replace("/onboarding" as never);
      return;
    }

    const route = ROLE_ROUTES[user.role as Role];
    if (route) {
      router.replace(route as never);
    }
  }, [user, isLoading, error, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon icon={DeliveryTruck02Icon} size={22} />
          </div>
          <div className="space-y-0.5">
            <span className="block text-sm font-semibold tracking-tight text-foreground">Zendak</span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Logistics business platform
            </span>
          </div>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-primary">
          <Icon icon={Loading03Icon} size={24} className="animate-spin" />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Authenticating
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Routing you back into your Zendak workspace for fleet, trip, and finance control.
          </p>
        </div>
      </div>
    </div>
  );
}
