import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";
import { cn } from "../../lib/utils";

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  loading?: boolean;
}

export function Button({
  children,
  variant = "default",
  className,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      className={cn(
        "items-center justify-center rounded-full px-6 py-3.5",
        variant === "default" && "bg-primary/90 active:opacity-80",
        variant === "outline" && "border border-primary/90",
        variant === "ghost" && "bg-transparent",
        isDisabled && "opacity-70",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : typeof children === "string" ? (
        <Text
          className={cn(
            "text-base font-bold",
            variant === "default" && "text-white",
            variant === "outline" && "text-primary/90",
            variant === "ghost" && "text-primary/90",
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
