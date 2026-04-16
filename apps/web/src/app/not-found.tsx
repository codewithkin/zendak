"use client";

import { Home01Icon, MapsSearchIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";

import Link from "next/link";

import { Button } from "@zendak/ui/components/button";
import { Icon } from "@zendak/ui/components/icon";

export default function NotFound() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-8 px-4 transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-primary">
          <Icon icon={MapsSearchIcon} size={28} />
        </div>
        <span
          className="select-none font-bold leading-none tracking-tighter text-foreground/[0.04]"
          style={{ fontSize: "clamp(5rem, 20vw, 9rem)" }}
          aria-hidden="true"
        >
          404
        </span>
        <div className="-mt-4 flex flex-col items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground">Route not found</h1>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            This Zendak workspace route doesn&apos;t exist, or the logistics view you wanted has moved.
          </p>
        </div>
      </div>
      <Button render={<Link href="/" />}>
        <Icon icon={Home01Icon} size={16} />
        Back to home
      </Button>
    </div>
  );
}
