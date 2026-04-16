import { cn } from "heroui-native";
import { type PropsWithChildren } from "react";
import { Pressable, Text, View, type PressableProps, type TextProps } from "react-native";

const buttonVariantClasses = {
  default: "bg-primary border-primary",
  secondary: "bg-secondary border-border",
  outline: "bg-transparent border-border",
  ghost: "bg-transparent border-transparent",
} as const;

const buttonSizeClasses = {
  sm: "h-10 px-4",
  md: "h-11 px-4.5",
  lg: "h-12 px-5",
} as const;

const labelVariantClasses = {
  default: "text-primary-foreground",
  secondary: "text-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
} as const;

const labelSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const;

type ButtonVariant = keyof typeof buttonVariantClasses;
type ButtonSize = keyof typeof buttonSizeClasses;

type ButtonProps = PressableProps & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

type ButtonLabelProps = TextProps & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  children,
  className,
  variant = "default",
  size = "md",
  fullWidth = false,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "items-center justify-center rounded-xl border",
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        fullWidth && "w-full",
        props.disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <View className="flex-row items-center justify-center gap-2">
        {typeof children === "string" ? (
          <ButtonLabel variant={variant} size={size}>{children}</ButtonLabel>
        ) : children}
      </View>
    </Pressable>
  );
}

export function ButtonLabel({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}: PropsWithChildren<ButtonLabelProps>) {
  return (
    <Text
      className={cn(
        "font-medium",
        labelVariantClasses[variant],
        labelSizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </Text>
  );
}