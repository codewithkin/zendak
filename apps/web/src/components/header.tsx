"use client";
import { DashboardSquare01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Icon } from "@zendak/ui/components/icon";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const links = [{ to: "/", label: "Workspace" }] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon icon={DashboardSquare01Icon} size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Zendak</p>
            <p className="text-[11px] text-muted-foreground">Logistics business management platform</p>
          </div>
        </div>
        <nav className="flex gap-4 text-sm">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
