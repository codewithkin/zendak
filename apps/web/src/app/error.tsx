"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Button } from "@zendak/ui/components/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    console.error("[Zendak error boundary]", error);
  }, [error]);

  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-8 px-4 transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          className="select-none font-bold leading-none tracking-tighter text-destructive/10"
          style={{ fontSize: "clamp(4rem, 15vw, 8rem)" }}
          aria-hidden="true"
        >
          Oops
        </span>
        <div className="-mt-4 flex flex-col items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground">Something went wrong</h1>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            An unexpected error occurred. Please try again or return to the home page.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" render={<Link href="/" />}>
          Go home
        </Button>
      </div>
    </div>
  );
}
