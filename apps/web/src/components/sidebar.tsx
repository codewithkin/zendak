"use client";

import {
  LayoutDashboardIcon,
  TruckIcon,
  UsersIcon,
  MapIcon,
  ReceiptIcon,
  DollarSignIcon,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@zendak/ui/components/button";
import { Separator } from "@zendak/ui/components/separator";

import type { User } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/use-auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Trucks", href: "/dashboard/trucks", icon: TruckIcon },
  { label: "Drivers", href: "/dashboard/drivers", icon: UsersIcon },
  { label: "Trips", href: "/dashboard/trips", icon: MapIcon },
  { label: "Expenses", href: "/dashboard/expenses", icon: ReceiptIcon },
  { label: "Finance", href: "/dashboard/finance", icon: DollarSignIcon },
];

function getNavItems(role: User["role"]): NavItem[] {
  switch (role) {
    case "ADMIN":
      return allNavItems;
    case "ACCOUNTANT":
      return allNavItems.filter((item) =>
        ["Dashboard", "Expenses", "Finance"].includes(item.label),
      );
    case "OPERATIONS":
      return allNavItems.filter((item) =>
        ["Dashboard", "Trucks", "Drivers", "Trips"].includes(item.label),
      );
    case "DRIVER":
      return allNavItems.filter((item) =>
        ["Dashboard", "Trips"].includes(item.label),
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
    <aside className="hidden w-56 flex-col border-r bg-muted/30 md:flex">
      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Navigation
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
              className={`flex items-center gap-2.5 rounded-none px-2 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="size-4" />
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
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOutIcon className="size-3.5" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
