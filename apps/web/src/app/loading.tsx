import { Loading03Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@zendak/ui/components/icon";

export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon icon={Loading03Icon} size={28} className="animate-spin" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold text-foreground">Preparing Zendak</p>
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Loading fleet operations
        </span>
      </div>
    </div>
  );
}
