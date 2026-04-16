"use client";

import {
  BuildingIcon,
  DeliveryTruck02Icon,
  LocationAdd01Icon,
  PhoneCall,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
import { Icon } from "@zendak/ui/components/icon";
import { Input } from "@zendak/ui/components/input";
import { Label } from "@zendak/ui/components/label";

import { useMe } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useMe();
  const { submitOnboarding, isLoading } = useOnboarding();

  const [form, setForm] = useState({
    businessName: "",
    location: "",
    truckCount: "",
    employeeCount: "",
    phone: "",
  });

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace("/sign-in" as never);
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/dashboard" as never);
      return;
    }
    if (user.onboardedAt) {
      router.replace("/dashboard/admin" as never);
    }
  }, [user, userLoading, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submitOnboarding({
        businessName: form.businessName,
        location: form.location,
        truckCount: parseInt(form.truckCount, 10) || 0,
        employeeCount: parseInt(form.employeeCount, 10) || 0,
        phone: form.phone || undefined,
      });
      toast.success("Workspace set up successfully");
      router.replace("/dashboard/admin" as never);
    } catch {
      toast.error("Failed to save business details. Please try again.");
    }
  }

  if (userLoading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon icon={DeliveryTruck02Icon} size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Set up your workspace</h1>
          <p className="text-sm text-muted-foreground">
            Tell us about your logistics business so Zendak can personalise your workspace.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business name */}
          <div className="space-y-2">
            <Label htmlFor="businessName" className="flex items-center gap-2">
              <Icon icon={BuildingIcon} size={14} className="text-muted-foreground" />
              Business name
            </Label>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="Acme Logistics Ltd"
              value={form.businessName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <Icon icon={LocationAdd01Icon} size={14} className="text-muted-foreground" />
              Primary location
            </Label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="Nairobi, Kenya"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* Truck + employee count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="truckCount" className="flex items-center gap-2">
                <Icon icon={DeliveryTruck02Icon} size={14} className="text-muted-foreground" />
                Number of trucks
              </Label>
              <Input
                id="truckCount"
                name="truckCount"
                type="number"
                min="0"
                placeholder="0"
                value={form.truckCount}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCount" className="flex items-center gap-2">
                <Icon icon={UserGroupIcon} size={14} className="text-muted-foreground" />
                Number of employees
              </Label>
              <Input
                id="employeeCount"
                name="employeeCount"
                type="number"
                min="0"
                placeholder="0"
                value={form.employeeCount}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Icon icon={PhoneCall} size={14} className="text-muted-foreground" />
              Business phone
              <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+254 700 000 000"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Setting up workspace…" : "Launch my Zendak workspace"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          You can update these details later from your workspace settings.
        </p>
      </div>
    </div>
  );
}
