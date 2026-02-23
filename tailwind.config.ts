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
      fontFamily: {
        // Structural — Syne (orientation, architecture)
        display: ["Syne", "sans-serif"],
        // Editorial — Domaine Display Narrow (narrative, headings)
        domaine: ["Domaine Display Narrow", "serif"],
        editorial: ["Domaine Display Narrow", "Cormorant Garamond", "Georgia", "serif"],
        serif: ["Domaine Display Narrow", "Cormorant Garamond", "Georgia", "serif"],
        cormorant: ["Cormorant Garamond", "Georgia", "serif"],
        // Functional — Raela Pro (body, UI, system)
        body: ["Raela Pro", "system-ui", "sans-serif"],
        raela: ["Raela Pro", "system-ui", "sans-serif"],
        sans: ["Raela Pro", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        ghost: {
          DEFAULT: "hsl(var(--ghost))",
          foreground: "hsl(var(--ghost-foreground))",
        },
        atmosphere: {
          DEFAULT: "hsl(var(--atmosphere))",
          foreground: "hsl(var(--atmosphere-foreground))",
        },
        portal: {
          navy: "hsl(var(--portal-navy))",
          gold: "hsl(var(--portal-gold))",
          warm: "hsl(var(--portal-warm-bg))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        capacityBlink: {
          "0%, 100%": { opacity: "0.25", backgroundColor: "hsl(var(--accent) / 0.25)" },
          "25%, 50%": { opacity: "1", backgroundColor: "hsl(var(--accent))" },
          "75%": { opacity: "0.25", backgroundColor: "hsl(var(--accent) / 0.25)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        drift: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "pulse-glow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.4)", opacity: "0" },
        },
        "seam-breathe": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "ring-rotate": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "ripple": {
          "0%": { width: "0px", height: "0px", opacity: "0.6" },
          "100%": { width: "300px", height: "300px", opacity: "0" },
        },
        "gradient-border": {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "300% center" },
        },
        // Light ray accents for project cards
        "light-ray-corner": {
          "0%, 100%": {
            opacity: "0",
            transform: "translate(0, 0) rotate(45deg)"
          },
          "15%, 85%": {
            opacity: "0.55",
            transform: "translate(15px, 15px) rotate(45deg)"
          },
        },
        "light-ray-edge": {
          "0%, 100%": {
            opacity: "0",
            transform: "translateX(-100%)"
          },
          "15%, 85%": {
            opacity: "0.50",
            transform: "translateX(0%)"
          },
        },
        "crt-sweep": {
          "0%": {
            opacity: "0",
            transform: "translateX(-150%) rotate(-35deg)"
          },
          "35%, 65%": {
            opacity: "0.25",
            transform: "translateX(0%) rotate(-35deg)"
          },
          "100%": {
            opacity: "0",
            transform: "translateX(150%) rotate(-35deg)"
          },
        },
        // Scanline flicker slowed down for performance (was 0.15s, now 4s)
        "scanline-flicker": {
          "0%, 100%": { opacity: "0.03" },
          "50%": { opacity: "0.05" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        drift: "drift 40s linear infinite",
        marquee: "marquee 12s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
        "gradient-shift": "gradient-shift 15s ease infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "seam-breathe": "seam-breathe 4s ease-in-out infinite",
        "ring-rotate": "ring-rotate 4s linear infinite",
        "text-shimmer": "text-shimmer 3s ease-in-out infinite",
        "ripple": "ripple 1s ease-out forwards",
        "gradient-border": "gradient-border 4s linear infinite",
        "light-ray-corner": "light-ray-corner 8s ease-in-out infinite",
        "light-ray-edge": "light-ray-edge 10s ease-in-out infinite",
        "crt-sweep": "crt-sweep 12s ease-in-out infinite",
        "scanline-flicker": "scanline-flicker 4s linear infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
