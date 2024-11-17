import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#800000",
          foreground: "#FAF7F2",
        },
        secondary: {
          DEFAULT: "#D4B8B8",
          foreground: "#2C1810",
        },
        accent: {
          DEFAULT: "#4A1818",
          foreground: "#FAF7F2",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#E8D9D9",
          foreground: "#2C1810",
        },
        popover: {
          DEFAULT: "#FAF7F2",
          foreground: "#2C1810",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2C1810",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float-up": {
          "0%": {
            transform: "translateY(0) scale(1)",
            opacity: "0",
          },
          "50%": {
            opacity: "0.8",
            transform: "translateY(-40px) scale(1.2)",
          },
          "100%": {
            transform: "translateY(-80px) scale(0.8)",
            opacity: "0",
          },
        },
        "ripple": {
          "0%": {
            transform: "scale(0)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(4)",
            opacity: "0",
          },
        },
        "bubble": {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
          },
          "50%": {
            transform: "translateY(-20px) scale(1.1)",
          },
        },
        "sparkle": {
          "0%, 100%": {
            transform: "scale(0) rotate(0deg)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1) rotate(180deg)",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-up": "float-up 4s ease-out infinite",
        "ripple": "ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        "bubble": "bubble 2s ease-in-out infinite",
        "sparkle": "sparkle 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;