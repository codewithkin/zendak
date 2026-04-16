"use client";

import { DeliveryTruck02Icon, LockPasswordIcon, Login01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
import { Icon } from "@zendak/ui/components/icon";
import { Input } from "@zendak/ui/components/input";
import { Label } from "@zendak/ui/components/label";

import { useLogin } from "@/hooks/use-auth";

export default function SignInPage() {
  const router = useRouter();
  const { login, isLoading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login({ email, password });
      router.replace("/loading");
    } catch {
      toast.error("Invalid email or password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon icon={DeliveryTruck02Icon} size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Sign in to Zendak</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to return to your fleet, trips, costs, and margins.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Icon icon={Mail01Icon} size={14} className="text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Icon icon={LockPasswordIcon} size={14} className="text-muted-foreground" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Icon icon={Login01Icon} size={16} />
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-primary underline-offset-4 hover:underline">
            Create your Zendak workspace
          </a>
        </p>
      </div>
    </div>
  );
}
