import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";

type IconProps = {
  icon: IconSvgElement;
  size?: number | string;
  strokeWidth?: number;
  color?: string;
  className?: string;
};

export function Icon({
  icon,
  size = 20,
  strokeWidth = 1.8,
  color,
  className,
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
    />
  );
}