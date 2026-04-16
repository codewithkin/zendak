"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { User } from "./use-auth";

const ROLE_ROUTES: Record<User["role"], string> = {
  ADMIN: "/dashboard/admin",
  ACCOUNTANT: "/dashboard/finance",
  OPERATIONS: "/dashboard/ops",
  DRIVER: "/dashboard/driver",
};

/**
 * Redirect the user away if they land on a dashboard route they don't own.
 * e.g. DRIVER trying to visit /dashboard/admin → redirected to /dashboard/driver
 */
export function useRoleGuard(user: User | null, currentPath: string) {
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const allowed = ROLE_ROUTES[user.role];

    // Only enforce protection on role-specific dashboard pages
    const guardedPrefixes = [
      "/dashboard/admin",
      "/dashboard/finance",
      "/dashboard/ops",
      "/dashboard/driver",
    ];

    const isGuarded = guardedPrefixes.some((prefix) => currentPath.startsWith(prefix));
    if (!isGuarded) return;

    const isAllowed = currentPath.startsWith(allowed);
    if (!isAllowed) {
      router.replace(allowed as never);
    }
  }, [user, currentPath, router]);
}
