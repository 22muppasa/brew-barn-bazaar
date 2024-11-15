import type { Config } from "tailwindcss";

export default {
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
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#800000", // Deep maroon
          foreground: "#FAF7F2",
        },
        secondary: {
          DEFAULT: "#D4B8B8", // Light maroon/pink
          foreground: "#2C1810",
        },
        accent: {
          DEFAULT: "#4A1818", // Dark maroon
          foreground: "#FAF7F2",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#E8D9D9", // Very light maroon
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fall-and-spin": {
          "0%": {
            transform: "translateY(-10px) rotate(0deg)",
            opacity: "0",
          },
          "10%": { opacity: "1" },
          "100%": {
            transform: "translateY(100vh) rotate(720deg)",
            opacity: "0",
          },
        },
        "sway": {
          "0%, 100%": {
            transform: "translateX(0) rotate(0deg)",
          },
          "50%": {
            transform: "translateX(20px) rotate(15deg)",
          },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fall-and-spin": "fall-and-spin 8s linear infinite",
        "sway": "sway 3s ease-in-out infinite",
        "float-up": "float-up 4s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;