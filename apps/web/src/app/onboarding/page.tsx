"use client";

import {
  BuildingIcon,
  DeliveryTruck02Icon,
  LocationAdd01Icon,
  PhoneCall,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@zendak/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@zendak/ui/components/dropdown-menu";
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

const TRUCK_OPTIONS = [
  { label: "1-10", value: 5 },
  { label: "10-20", value: 15 },
  { label: "30-50", value: 40 },
  { label: "50-100", value: 75 },
  { label: "100+", value: 150 },
];

const EMPLOYEE_OPTIONS = [
  { label: "1-10", value: 5 },
  { label: "10-20", value: 15 },
  { label: "30-50", value: 40 },
  { label: "50-100", value: 75 },
  { label: "100+", value: 150 },
];

const COUNTRIES = [
  { code: "+1", name: "United States" },
  { code: "+44", name: "United Kingdom" },
  { code: "+254", name: "Kenya" },
  { code: "+27", name: "South Africa" },
  { code: "+256", name: "Uganda" },
  { code: "+233", name: "Ghana" },
  { code: "+234", name: "Nigeria" },
  { code: "+255", name: "Tanzania" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useMe();
  const { submitOnboarding, isLoading } = useOnboarding();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: "",
    country: "",
    countryCode: COUNTRIES[2].code, // Kenya by default
    address: "",
    phone: "",
    truckCount: 0,
    employeeCount: 0,
    hasPreviousTMSExperience: null as boolean | null,
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
        location: `${form.address}, ${form.country}`,
        truckCount: form.truckCount,
        employeeCount: form.employeeCount,
        phone: form.phone ? `${form.countryCode} ${form.phone}` : undefined,
      });
      toast.success("Workspace set up successfully");
      router.replace("/dashboard/admin" as never);
    } catch {
      toast.error("Failed to save business details. Please try again.");
    }
  }

  function nextStep() {
    if (step < 4) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  const isStep1Complete =
    form.businessName.trim() && form.country.trim() && form.address.trim() && form.phone.trim();
  const isStep2Complete = form.truckCount > 0;
  const isStep3Complete = form.employeeCount > 0;
  const isStep4Complete = form.hasPreviousTMSExperience !== null;

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
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
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
          <span className="text-sm font-semibold tracking-tight text-white">
            Zendak
          </span>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 space-y-2">
          <p className="text-2xl font-semibold leading-tight text-white">
            Your fleet.
            <br />
            Your command centre.
          </p>
          <p className="text-sm text-neutral-400">
            Built for logistics teams that move fast and need real data.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-auto bg-white px-6 py-12">
        <div className="w-full max-w-[440px]">
          {/* Progress indicator */}
          <div className="mb-8 flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-neutral-900" : "bg-neutral-200"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepBusinessData
                  form={form}
                  handleChange={handleChange}
                  setForm={setForm}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepTrucks
                  value={form.truckCount}
                  onSelect={(count) =>
                    setForm((prev) => ({ ...prev, truckCount: count }))
                  }
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepEmployees
                  value={form.employeeCount}
                  onSelect={(count) =>
                    setForm((prev) => ({ ...prev, employeeCount: count }))
                  }
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepTMSExperience
                  value={form.hasPreviousTMSExperience}
                  onSelect={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      hasPreviousTMSExperience: value,
                    }))
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={prevStep} className="flex-1">
                Back
              </Button>
            )}
            {step < 4 && (
              <Button
                onClick={nextStep}
                disabled={
                  (step === 1 && !isStep1Complete) ||
                  (step === 2 && !isStep2Complete) ||
                  (step === 3 && !isStep3Complete)
                }
                className="flex-1"
              >
                Next
              </Button>
            )}
            {step === 4 && (
              <Button
                onClick={handleSubmit}
                disabled={!isStep4Complete || isLoading}
                className="flex-1"
              >
                {isLoading ? "Launching…" : "Launch workspace"}
              </Button>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-neutral-400">
            You can update these details later from workspace settings.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Business Data ──
function StepBusinessData({
  form,
  handleChange,
  setForm,
}: any) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          Business Information
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Tell us about your logistics company.
        </p>
      </div>

      <form className="space-y-4">
        {/* 2x2 Grid for 4 fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            htmlFor="country"
            icon={LocationAdd01Icon}
            label="Primary country"
            required
          >
            <Input
              id="country"
              name="country"
              placeholder="e.g., Kenya"
              value={form.country}
              onChange={(e) => setForm((prev: any) => ({ ...prev, country: e.target.value }))}
              required
            />
          </FieldCard>

          <FieldCard
            htmlFor="address"
            icon={LocationAdd01Icon}
            label="Primary address"
            required
          >
            <Input
              id="address"
              name="address"
              placeholder="e.g., Nairobi"
              value={form.address}
              onChange={handleChange}
              required
            />
          </FieldCard>

          <FieldCard
            htmlFor="phone"
            icon={PhoneCall}
            label="Business phone"
            required
          >
            <div className="flex gap-2">
              <PhoneCountryCodeSelector
                value={form.countryCode}
                onChange={(code) =>
                  setForm((prev: any) => ({ ...prev, countryCode: code }))
                }
              />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="700 000 000"
                value={form.phone}
                onChange={handleChange}
                required
                className="flex-1"
              />
            </div>
          </FieldCard>
        </div>
      </form>
    </div>
  );
}

// ── Step 2: Trucks ──
function StepTrucks({ value, onSelect }: any) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          How many trucks?
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Select the range that best fits your fleet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TRUCK_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              value === option.value
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
            }`}
          >
            <p className="text-2xl font-semibold">{option.label}</p>
            <p className="mt-1 text-xs text-neutral-500">trucks</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Step 3: Employees ──
function StepEmployees({ value, onSelect }: any) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          Team size
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          How many employees do you have?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EMPLOYEE_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              value === option.value
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
            }`}
          >
            <p className="text-2xl font-semibold">{option.label}</p>
            <p className="mt-1 text-xs text-neutral-500">employees</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Step 4: TMS Experience ──
function StepTMSExperience({ value, onSelect }: any) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          Transport management experience
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Have you used transport management software before?
        </p>
      </div>

      <div className="flex gap-3">
        <motion.button
          type="button"
          onClick={() => onSelect(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 rounded-xl border-2 p-6 text-center transition-all ${
            value === true
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
          }`}
        >
          <p className="text-lg font-semibold">Yes</p>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => onSelect(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 rounded-xl border-2 p-6 text-center transition-all ${
            value === false
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
          }`}
        >
          <p className="text-lg font-semibold">No</p>
        </motion.button>
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
      <Label
        htmlFor={htmlFor}
        className="mb-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500"
      >
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

// ── Phone Country Code Selector Component ──
function PhoneCountryCodeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.code.includes(search) || country.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustomCode = () => {
    if (search.trim()) {
      onChange(search.trim());
      setSearch("");
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-24 items-center justify-between rounded-lg border border-input bg-transparent px-2 text-sm text-neutral-900 outline-none transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-neutral-200"
        >
          <span className="font-medium">{value}</span>
          <svg
            className="h-4 w-4 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 p-0">
        <div className="border-b border-neutral-200 p-2">
          <input
            type="text"
            placeholder="Search or enter code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            autoFocus
            className="w-full rounded border border-neutral-200 px-2 py-1.5 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200"
          />
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filteredCountries.map((country) => (
            <DropdownMenuItem
              key={country.code}
              onClick={() => {
                onChange(country.code);
                setSearch("");
                setOpen(false);
              }}
              className={`cursor-pointer ${
                value === country.code
                  ? "bg-neutral-100 font-medium text-neutral-900"
                  : ""
              }`}
            >
              <span className="text-sm">
                {country.code} • {country.name}
              </span>
            </DropdownMenuItem>
          ))}
          {filteredCountries.length < 5 && search.trim() && (
            <button
              type="button"
              onClick={handleAddCustomCode}
              className="w-full border-t border-neutral-200 px-2 py-2 text-center text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800"
            >
              Add "{search}"
            </button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
