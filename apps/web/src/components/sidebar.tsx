"use client";

import {
  Alert01Icon,
  Alert02Icon,
  AnalyticsUpIcon,
  DashboardSquare01Icon,
  DeliveryTruck02Icon,
  Invoice01Icon,
  Logout01Icon,
  MapsLocation01Icon,
  UserGroupIcon,
  UserMultipleIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@zendak/ui/components/button";
import { Icon } from "@zendak/ui/components/icon";
import { Separator } from "@zendak/ui/components/separator";

import type { User } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/use-auth";

type IconSvgElement = any;

interface NavItem {
  label: string;
  href: string;
  icon: IconSvgElement;
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
  { label: "Trucks", href: "/dashboard/trucks", icon: DeliveryTruck02Icon },
  { label: "Drivers", href: "/dashboard/drivers", icon: UserGroupIcon },
  { label: "Trips", href: "/dashboard/trips", icon: MapsLocation01Icon },
  { label: "Expenses", href: "/dashboard/expenses", icon: Invoice01Icon },
  { label: "Finance", href: "/dashboard/finance", icon: Wallet02Icon },
  { label: "Issues", href: "/dashboard/issues", icon: Alert02Icon },
  { label: "Reports", href: "/dashboard/reports", icon: AnalyticsUpIcon },
  { label: "Crash Reports", href: "/dashboard/crash-reports", icon: Alert01Icon },
  { label: "Users", href: "/dashboard/admin/users", icon: UserMultipleIcon },
];

function getNavItems(role: User["role"]): NavItem[] {
  switch (role) {
    case "ADMIN":
      return allNavItems;
    case "ACCOUNTANT":
      return allNavItems.filter((item) =>
        ["Dashboard", "Expenses", "Finance", "Reports"].includes(item.label),
      );
    case "OPERATIONS":
      return allNavItems.filter((item) =>
        ["Dashboard", "Trucks", "Drivers", "Trips", "Issues", "Reports", "Crash Reports"].includes(item.label),
      );
    case "DRIVER":
      return allNavItems.filter((item) =>
        ["Dashboard", "Trips", "Issues", "Crash Reports"].includes(item.label),
      );
    default:
      return [allNavItems[0]];
  }
}

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const navItems = getNavItems(user.role);

  function handleLogout() {
    logout();
    router.replace("/sign-in" as never);
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-muted/30 md:flex">
      <div className="space-y-2 px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon icon={DeliveryTruck02Icon} size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Zendak</p>
            <p className="text-[11px] text-muted-foreground">
              Logistics business control center
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" ||
                pathname.startsWith("/dashboard/admin") ||
                pathname.startsWith("/dashboard/finance") ||
                pathname.startsWith("/dashboard/ops") ||
                pathname.startsWith("/dashboard/driver")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href as never}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon icon={item.icon} size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <div className="mb-2 px-2">
          <p className="truncate text-xs font-medium">{user.name}</p>
          <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Managing fleet, trips, and revenue in one place.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 rounded-lg"
          onClick={handleLogout}
        >
          <Icon icon={Logout01Icon} size={15} />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
