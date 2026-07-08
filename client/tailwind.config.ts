import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F8FAFC",
        sidebar: "#0F172A",
        primary: "#3B82F6",
        "primary-hover": "#2563EB",
        "text-dark": "#0F172A",
        "text-gray": "#64748B",
        border: "#E2E8F0",
        card: "#FFFFFF",
        "badge-green": "#ECFDF5",
        "badge-yellow": "#FFFBEB",
        "badge-red": "#FEF2F2",
        "badge-blue": "#EFF6FF",
      },
      borderRadius: {
        btn: "9px",
        card: "14px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
        "fade-in": "fade-in .15s ease",
      },
    },
  },
  plugins: [],
} satisfies Config;
