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

export default function DashboardIndex() {
  const router = useRouter();
  const { user, isLoading } = useMe();

  useEffect(() => {
    if (isLoading || !user) return;
    const route = ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES];
    if (route) {
      router.replace(route as never);
    }
  }, [user, isLoading, router]);

  return null;
}
