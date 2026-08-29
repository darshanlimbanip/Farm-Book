import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B5E20",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F9A825",
          foreground: "#212121",
        },
        success: "#2E7D32",
        danger: "#C62828",
        background: "#FAFAFA",
        foreground: "#212121",
        muted: {
          DEFAULT: "#757575",
          foreground: "#757575",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#212121",
        },
        border: "#E0E0E0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-gujarati)", "sans-serif"],
        gujarati: ["var(--font-noto-gujarati)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
