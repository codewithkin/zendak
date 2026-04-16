import { Loading03Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@zendak/ui/components/icon";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-primary">
        <Icon icon={Loading03Icon} size={24} className="animate-spin" />
      </div>
    </div>
  );
}
