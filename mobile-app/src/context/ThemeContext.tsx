import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  /** The effective active theme ("light" or "dark") */
  theme: "light" | "dark";
  /** The user's chosen theme mode ("light", "dark", or "system") */
  mode: ThemeMode;
  /** Update the theme mode */
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "todai_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme();

  const [deviceColorScheme, setDeviceColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [mode, setModeState] = useState<ThemeMode>("light");

  // Track device color scheme if user explicitly chooses "system" mode
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDeviceColorScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  // Load persisted theme preference on mount (defaulting to "light")
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
          setModeState("light");
        }
      } catch (e) {
        console.error("Failed to load theme mode", e);
        setModeState("light");
      }
    })();
  }, []);

  // Calculate active effective theme ("light" or "dark") — default is ALWAYS "light"
  const effectiveTheme: "light" | "dark" =
    mode === "system"
      ? deviceColorScheme === "dark"
        ? "dark"
        : "light"
      : mode;

  // Sync NativeWind colorScheme strictly with effectiveTheme ("light" by default)
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

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, mode, setMode }}>
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
