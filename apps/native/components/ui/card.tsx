import { cn } from "heroui-native";
import { type PropsWithChildren } from "react";
import { Text, View, type TextProps, type ViewProps } from "react-native";

type CardProps = ViewProps & {
  className?: string;
};

type CardTextProps = TextProps & {
  className?: string;
};

export function Card({ children, className, ...props }: PropsWithChildren<CardProps>) {
  return (
    <View className={cn("rounded-xl border border-border bg-background", className)} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ children, className, ...props }: PropsWithChildren<CardProps>) {
  return (
    <View className={cn("gap-1.5 p-5 pb-0", className)} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ children, className, ...props }: PropsWithChildren<CardProps>) {
  return (
    <View className={cn("p-5", className)} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, className, ...props }: PropsWithChildren<CardTextProps>) {
  return (
    <Text className={cn("text-lg font-semibold text-foreground", className)} {...props}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, className, ...props }: PropsWithChildren<CardTextProps>) {
  return (
    <Text className={cn("text-sm leading-5 text-muted", className)} {...props}>
      {children}
    </Text>
  );
}