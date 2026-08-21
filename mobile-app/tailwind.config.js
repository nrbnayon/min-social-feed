/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        bg2: "rgb(var(--bg2) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface2) / <alpha-value>)",
        surface3: "rgb(var(--surface3) / <alpha-value>)",
        textPrimary: "rgb(var(--text) / <alpha-value>)",
        textSecondary: "rgb(var(--text2) / <alpha-value>)",
        textMuted: "rgb(var(--text3) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          light: "rgb(var(--brand2) / <alpha-value>)",
        },
        brand2: "rgb(var(--brand2) / <alpha-value>)",
        pink: "rgb(var(--pink) / <alpha-value>)",
        green: "rgb(var(--green) / <alpha-value>)",
        yellow: "rgb(var(--yellow) / <alpha-value>)",
        border: "rgb(var(--border-color) / <alpha-value>)",
        borderStrong: "rgb(var(--border-strong) / <alpha-value>)",
        input: {
          DEFAULT: "rgb(var(--input-bg) / <alpha-value>)",
          border: "rgb(var(--input-border) / <alpha-value>)",
          bg: "rgb(var(--input-bg) / <alpha-value>)",
        },
      },
      borderRadius: {
        "4xl": "32px",
        "3xl": "24px",
        "2xl": "20px",
        xl: "16px",
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
    },
  },
  plugins: [],
};