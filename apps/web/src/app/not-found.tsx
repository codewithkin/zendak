"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Button } from "@zendak/ui/components/button";

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
        <span
          className="select-none font-bold leading-none tracking-tighter text-foreground/[0.04]"
          style={{ fontSize: "clamp(5rem, 20vw, 9rem)" }}
          aria-hidden="true"
        >
          404
        </span>
        <div className="-mt-4 flex flex-col items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground">Page not found</h1>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
      </div>
      <Button render={<Link href="/" />}>Back to home</Button>
    </div>
  );
}
