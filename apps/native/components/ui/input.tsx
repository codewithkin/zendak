import { cn, useThemeColor } from "heroui-native";
import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";

type InputProps = TextInputProps & {
  className?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { className, placeholderTextColor, ...props },
  ref,
) {
  const mutedColor = useThemeColor("muted");

  return (
    <TextInput
      ref={ref}
      className={cn(
        "h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground",
        className,
      )}
      placeholderTextColor={placeholderTextColor ?? mutedColor}
      {...props}
    />
  );
});