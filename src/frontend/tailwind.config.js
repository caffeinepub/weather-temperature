/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bricolage Grotesque", "sans-serif"],
        body: ["Figtree", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "oklch(var(--warning) / <alpha-value>)",
          foreground: "oklch(var(--warning-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "oklch(var(--success) / <alpha-value>)",
          foreground: "oklch(var(--success-foreground) / <alpha-value>)",
        },
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glass: "0 4px 30px oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.1)",
        glow: "0 0 20px oklch(var(--primary) / 0.3)",
        "glow-lg": "0 0 40px oklch(var(--primary) / 0.4)",
        alert: "0 0 30px oklch(var(--destructive) / 0.4)",
      },
      animation: {
        "rain-fall": "rainFall 0.8s linear infinite",
        "snow-fall": "snowFall 3s linear infinite",
        "lightning-flash": "lightningFlash 4s ease-in-out infinite",
        "mist-drift": "mistDrift 8s ease-in-out infinite",
        "sun-pulse": "sunPulse 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "pulse-alert": "pulseAlert 1.5s ease-in-out infinite",
      },
      keyframes: {
        rainFall: {
          "0%": { transform: "translateY(-100px)", opacity: "0" },
          "10%": { opacity: "0.7" },
          "90%": { opacity: "0.7" },
          "100%": { transform: "translateY(110vh)", opacity: "0" },
        },
        snowFall: {
          "0%": { transform: "translateY(-50px) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.9" },
          "90%": { opacity: "0.9" },
          "100%": { transform: "translateY(110vh) translateX(20px)", opacity: "0" },
        },
        lightningFlash: {
          "0%, 85%, 90%, 95%, 100%": { opacity: "0" },
          "86%, 91%, 96%": { opacity: "0.9" },
        },
        mistDrift: {
          "0%, 100%": { transform: "translateX(-5%) scaleY(1)", opacity: "0.3" },
          "50%": { transform: "translateX(5%) scaleY(1.2)", opacity: "0.6" },
        },
        sunPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseAlert: {
          "0%, 100%": { boxShadow: "0 0 20px oklch(0.62 0.26 25 / 0.4)" },
          "50%": { boxShadow: "0 0 40px oklch(0.62 0.26 25 / 0.8)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
