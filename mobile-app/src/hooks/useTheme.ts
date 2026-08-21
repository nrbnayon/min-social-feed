import { Colors } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";

export function useTheme() {
  const { theme } = useAppTheme();
  return Colors[theme];
}
