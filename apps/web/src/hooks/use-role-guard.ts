"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { User } from "./use-auth";

// Define allowed pages for each role based on sidebar navigation
const ALLOWED_PAGES: Record<User["role"], string[]> = {
  ADMIN: [
    "/dashboard",
    "/dashboard/admin",
    "/dashboard/admin/users",
    "/dashboard/trucks",
    "/dashboard/drivers",
    "/dashboard/trips",
    "/dashboard/expenses",
    "/dashboard/finance",
    "/dashboard/issues",
    "/dashboard/reports",
    "/dashboard/crash-reports",
  ],
  ACCOUNTANT: ["/dashboard", "/dashboard/expenses", "/dashboard/finance", "/dashboard/reports"],
  OPERATIONS: [
    "/dashboard",
    "/dashboard/ops",
    "/dashboard/trucks",
    "/dashboard/drivers",
    "/dashboard/trips",
    "/dashboard/issues",
    "/dashboard/reports",
    "/dashboard/crash-reports",
  ],
  DRIVER: ["/dashboard", "/dashboard/driver", "/dashboard/trips", "/dashboard/issues", "/dashboard/crash-reports"],
};

const DEFAULT_ROUTES: Record<User["role"], string> = {
  ADMIN: "/dashboard/admin",
  ACCOUNTANT: "/dashboard/finance",
  OPERATIONS: "/dashboard/ops",
  DRIVER: "/dashboard/driver",
};

/**
 * Redirect the user away if they try to access a page not allowed for their role.
 * e.g. DRIVER trying to visit /dashboard/admin → redirected to /dashboard/driver
 */
export function useRoleGuard(user: User | null, currentPath: string) {
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const allowedPages = ALLOWED_PAGES[user.role];
    const defaultRoute = DEFAULT_ROUTES[user.role];

    // Check if current path is allowed for this role
    const isAllowed = allowedPages.some(
      (page) => currentPath === page || currentPath.startsWith(page + "/"),
    );

    // If not allowed, redirect to default route for this role
    if (!isAllowed) {
      router.replace(defaultRoute as never);
    }
  }, [user, currentPath, router]);
}
