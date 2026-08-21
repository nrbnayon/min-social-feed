import { Check } from "lucide-react-native";
import { Pressable, type PressableProps } from "react-native";
import { cn } from "../../lib/utils";

interface CheckboxProps extends Omit<PressableProps, "onPress"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  className,
  ...props
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onCheckedChange?.(!checked)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className={cn(
        "h-5 w-5 items-center justify-center rounded-md border-2",
        checked
          ? "border-primary bg-primary"
          : "border-primary dark:border-primary bg-transparent",
        className
      )}
      {...props}
    >
      {checked && <Check size={13} color="#FFFFFF" strokeWidth={3.5} />}
    </Pressable>
  );
}
