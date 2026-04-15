"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

    const route = ROLE_ROUTES[user.role as Role];
    if (route) {
      router.replace(route as never);
    }
  }, [user, isLoading, error, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">Z</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Zendak</span>
        </div>

        <div className="flex items-end gap-1.5 pt-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
        </div>

        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Authenticating
        </p>
      </div>
    </div>
  );
}
