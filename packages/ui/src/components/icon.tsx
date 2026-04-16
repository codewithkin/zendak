import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { cn } from "@zendak/ui/lib/utils";

type IconProps = {
  icon: IconSvgElement;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

function Icon({ icon, size = 18, strokeWidth = 1.8, className }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
    />
  );
}

export { Icon };