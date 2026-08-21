import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { Colors, ThemeColors } from "@/constants/theme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  /** The effective active theme ("light" or "dark") */
  theme: "light" | "dark";
  /** Whether the active theme is dark */
  isDark: boolean;
  /** Current active color palette object for inline styles / Lucide icons */
  colors: ThemeColors;
  /** The user's chosen theme mode ("light", "dark", or "system") */
  mode: ThemeMode;
  /** Update the theme mode */
  setMode: (mode: ThemeMode) => Promise<void>;
  /** Quickly toggle between light and dark */
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "min_social_feed_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme();

  const [deviceColorScheme, setDeviceColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  // Default to dark mode first to match the sleek web experience
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDeviceColorScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  // Load persisted theme preference on mount
  useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          savedMode === "light" ||
          savedMode === "dark" ||
          savedMode === "system"
        ) {
          setModeState(savedMode);
        } else {
          setModeState("dark");
        }
      } catch (e) {
        console.error("Failed to load theme mode", e);
        setModeState("dark");
      }
    })();
  }, []);

  // Calculate active effective theme
  const effectiveTheme: "light" | "dark" =
    mode === "system"
      ? deviceColorScheme === "light"
        ? "light"
        : "dark"
      : mode;

  // Sync NativeWind colorScheme strictly with effectiveTheme
  useEffect(() => {
    setColorScheme(effectiveTheme);
  }, [mode, effectiveTheme, setColorScheme]);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.error("Failed to save theme mode", e);
    }
  };

  const toggleTheme = async () => {
    const nextMode = effectiveTheme === "dark" ? "light" : "dark";
    await setMode(nextMode);
  };

  const colors = Colors[effectiveTheme];
  const isDark = effectiveTheme === "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme: effectiveTheme,
        isDark,
        colors,
        mode,
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
}
