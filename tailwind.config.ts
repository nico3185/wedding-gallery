import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light mode colors
        bg: {
          light: "#FAFAF8",
          dark: "#130F0A",
          DEFAULT: "var(--color-bg)",
        },
        surface: {
          light: "#F0EDE6",
          dark: "#1E1810",
          DEFAULT: "var(--color-surface)",
        },
        surface2: {
          light: "#E5DFD6",
          dark: "#2A2118",
          DEFAULT: "var(--color-surface2)",
        },
        gold: "#D4922A",
        amber: {
          light: "#D4922A",
          DEFAULT: "#E8B366",
          dark: "#D4922A",
        },
        ember: {
          light: "#C85A0A",
          DEFAULT: "#F5C878",
          dark: "#F5C878",
        },
        warm: {
          light: "#2D2420",
          dark: "#F7EDD8",
          DEFAULT: "var(--color-warm)",
        },
        muted: {
          light: "#8B7D6B",
          dark: "#7A6A54",
          DEFAULT: "var(--color-muted)",
        },
        deep: {
          light: "#FFFFFF",
          dark: "#0D0A07",
          DEFAULT: "var(--color-deep)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
