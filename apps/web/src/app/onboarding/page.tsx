"use client";

import {
  BuildingIcon,
  DeliveryTruck02Icon,
  LocationAdd01Icon,
  PhoneCall,
  Route02Icon,
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

// Decorative nodes for the left panel fleet-network illustration
const NODES = [
  { cx: "18%", cy: "14%", r: 36 },
  { cx: "72%", cy: "22%", r: 28 },
  { cx: "38%", cy: "42%", r: 44 },
  { cx: "80%", cy: "52%", r: 22 },
  { cx: "22%", cy: "66%", r: 32 },
  { cx: "60%", cy: "76%", r: 38 },
  { cx: "14%", cy: "88%", r: 20 },
  { cx: "78%", cy: "88%", r: 26 },
];

const CONNECTIONS = [
  ["18%", "14%", "38%", "42%"],
  ["38%", "42%", "72%", "22%"],
  ["38%", "42%", "22%", "66%"],
  ["72%", "22%", "80%", "52%"],
  ["22%", "66%", "60%", "76%"],
  ["60%", "76%", "80%", "52%"],
  ["22%", "66%", "14%", "88%"],
  ["60%", "76%", "78%", "88%"],
];

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
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── Left decorative panel ── */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-neutral-950 p-10 lg:flex">
        {/* Fleet network illustration */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
          aria-hidden="true"
        >
          {CONNECTIONS.map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          ))}
          {NODES.map((n, i) => (
            <circle
              key={i}
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Branding */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <span className="text-sm font-bold text-neutral-950">Z</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Zendak</span>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 space-y-2">
          <p className="text-2xl font-semibold leading-tight text-white">
            Your fleet.<br />Your command centre.
          </p>
          <p className="text-sm text-neutral-400">
            Built for logistics teams that move fast and need real data.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-auto bg-white px-6 py-12">
        <div className="w-full max-w-[440px]">

          {/* Header */}
          <div className="mb-10">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
              <Icon icon={DeliveryTruck02Icon} size={18} className="text-neutral-700" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              Set up your workspace
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Tell us about your logistics operation so Zendak can be tailored to your fleet.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Field grid — business name + location */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <FieldCard
                htmlFor="businessName"
                icon={BuildingIcon}
                label="Business name"
                required
              >
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="Acme Logistics Ltd"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                />
              </FieldCard>

              <FieldCard
                htmlFor="location"
                icon={LocationAdd01Icon}
                label="Primary location"
                required
              >
                <Input
                  id="location"
                  name="location"
                  placeholder="Nairobi, Kenya"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </FieldCard>
            </div>

            {/* Field grid — trucks + employees */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <FieldCard
                htmlFor="truckCount"
                icon={DeliveryTruck02Icon}
                label="Number of trucks"
              >
                <Input
                  id="truckCount"
                  name="truckCount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.truckCount}
                  onChange={handleChange}
                />
              </FieldCard>

              <FieldCard
                htmlFor="employeeCount"
                icon={UserGroupIcon}
                label="Number of employees"
              >
                <Input
                  id="employeeCount"
                  name="employeeCount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.employeeCount}
                  onChange={handleChange}
                />
              </FieldCard>
            </div>

            {/* Phone — full width */}
            <div className="mb-8">
              <FieldCard
                htmlFor="phone"
                icon={PhoneCall}
                label="Business phone"
                hint="optional"
                fullWidth
              >
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+254 700 000 000"
                  value={form.phone}
                  onChange={handleChange}
                />
              </FieldCard>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Setting up workspace…" : "Launch my workspace"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400">
            You can update these details later from workspace settings.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helper sub-component ──
function FieldCard({
  htmlFor,
  icon,
  label,
  hint,
  required,
  fullWidth,
  children,
}: {
  htmlFor: string;
  icon: Parameters<typeof Icon>[0]["icon"];
  label: string;
  hint?: string;
  required?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-colors focus-within:border-neutral-400 focus-within:bg-white${fullWidth ? " col-span-2" : ""}`}
    >
      <Label htmlFor={htmlFor} className="mb-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        <Icon icon={icon} size={13} className="shrink-0" />
        {label}
        {hint && <span className="text-neutral-400">({hint})</span>}
        {required && <span className="text-red-400">*</span>}
      </Label>
      <div className="[&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0 [&_input]:shadow-none [&_input]:outline-0 [&_input]:ring-0 [&_input:focus]:ring-0 [&_input]:text-neutral-900 [&_input]::placeholder:text-neutral-400">
        {children}
      </div>
    </div>
  );
}
