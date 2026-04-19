"use client";

import { usePathname, useRouter } from "next/navigation";

import { Skeleton } from "@zendak/ui/components/skeleton";

import { Sidebar } from "@/components/sidebar";
import { TrialBanner } from "@/components/plan-gate";
import { useMe } from "@/hooks/use-auth";
import { useRoleGuard } from "@/hooks/use-role-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, error } = useMe();
  const router = useRouter();
  const pathname = usePathname();

  useRoleGuard(user, pathname ?? "");

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <header className="flex h-14 items-center border-b bg-background px-6">
          <Skeleton className="h-7 w-24" />
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-56 border-r bg-muted/30 p-4 md:block">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          </aside>
          <main className="flex-1 p-6">
            <Skeleton className="mb-4 h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (error || !user) {
    router.replace("/sign-in" as never);
    return null;
  }

  if (user.role === "ADMIN" && !user.onboardedAt) {
    router.replace("/onboarding" as never);
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">Z</span>
          </div>
          <span className="text-sm font-semibold">Zendak</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl space-y-4">
            <TrialBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
