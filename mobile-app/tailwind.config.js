/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  // NativeWind allows dark mode by class or media. We use system by default,
  // but keeping "class" lets you manually toggle if you ever need to via useColorScheme().
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
        },
        border: "rgb(var(--border-color) / <alpha-value>)",
        input: {
          DEFAULT: "rgb(var(--input-bg) / <alpha-value>)",
          border: "rgb(var(--input-border) / <alpha-value>)",
          bg: "rgb(var(--input-bg) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "#F5F7FA",
          foreground: "#78716C",
          dark: "#1E293B",
          "dark-foreground": "#A8A29E",
        },
      },

      fontFamily: {
        // Poppins — default / sans
        sans: ["Poppins_400Regular", "system-ui", "sans-serif"],
        poppins: ["Poppins_400Regular", "system-ui", "sans-serif"],
        medium: ["Poppins_500Medium", "system-ui", "sans-serif"],
        semibold: ["Poppins_600SemiBold", "system-ui", "sans-serif"],
        bold: ["Poppins_700Bold", "system-ui", "sans-serif"],
        extrabold: ["Poppins_800ExtraBold", "system-ui", "sans-serif"],
        black: ["Poppins_900Black", "system-ui", "sans-serif"],
        "poppins-black": ["Poppins_900Black", "system-ui", "sans-serif"],
        "poppins-extrabold": ["Poppins_800ExtraBold", "system-ui", "sans-serif"],

        // Plus Jakarta Sans (font-plus)
        plus: ["PlusJakartaSans_400Regular", "sans-serif"],
        "plus-regular": ["PlusJakartaSans_400Regular", "sans-serif"],
        "plus-medium": ["PlusJakartaSans_500Medium", "sans-serif"],
        "plus-semibold": ["PlusJakartaSans_600SemiBold", "sans-serif"],
        "plus-bold": ["PlusJakartaSans_700Bold", "sans-serif"],
        "plus-extrabold": ["PlusJakartaSans_800ExtraBold", "sans-serif"],

        // Fallbacks mapping old font-cormorant classes to Plus Jakarta Sans
        cormorant: ["PlusJakartaSans_400Regular", "sans-serif"],
        "cormorant-medium": ["PlusJakartaSans_500Medium", "sans-serif"],
        "cormorant-semibold": ["PlusJakartaSans_600SemiBold", "sans-serif"],
        "cormorant-bold": ["PlusJakartaSans_700Bold", "sans-serif"],
        "cormorant-extrabold": ["PlusJakartaSans_800ExtraBold", "sans-serif"],
        "cormorant-black": ["PlusJakartaSans_800ExtraBold", "sans-serif"],
      },

      borderRadius: {
        "4xl": "32px",
        "3xl": "24px",
        "2xl": "20px",
        xl: "14px",
        lg: "12px",
        base: "10px",
        md: "8px",
        sm: "6px",
        xs: "4px",
      },
    },
  },
  plugins: [],
};