import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    // Kiosk breakpoints
    screens: {
      'xs': '360px',      // Small mobile
      'sm': '480px',      // Mobile max
      'md': '768px',      // Tablet
      'lg': '1025px',     // Desktop / Kiosk portrait
      'xl': '1280px',     // Large desktop
      '2xl': '1920px',    // Kiosk landscape
      // Orientation-based breakpoints
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' },
      // Kiosk specific
      'kiosk-portrait': { 'raw': '(min-width: 1080px) and (orientation: portrait)' },
      'kiosk-landscape': { 'raw': '(min-width: 1920px) and (orientation: landscape)' },
      // Touch capability
      'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
    },
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      fontSize: {
        // Kiosk typography scale with fluid sizing
        "kiosk-xs": ["clamp(0.75rem, 0.5vw + 0.625rem, 0.875rem)", { lineHeight: "1.25rem" }],
        "kiosk-sm": ["clamp(0.875rem, 0.5vw + 0.75rem, 1rem)", { lineHeight: "1.5rem" }],
        "kiosk-base": ["clamp(1rem, 0.5vw + 0.875rem, 1.125rem)", { lineHeight: "1.75rem" }],
        "kiosk-lg": ["clamp(1.125rem, 0.5vw + 1rem, 1.25rem)", { lineHeight: "1.75rem" }],
        "kiosk-xl": ["clamp(1.25rem, 0.75vw + 1rem, 1.5rem)", { lineHeight: "2rem" }],
        "kiosk-2xl": ["clamp(1.5rem, 1vw + 1.125rem, 1.875rem)", { lineHeight: "2.25rem" }],
        "kiosk-3xl": ["clamp(1.875rem, 1.5vw + 1.25rem, 2.25rem)", { lineHeight: "2.5rem" }],
        "kiosk-4xl": ["clamp(2.25rem, 2vw + 1.5rem, 3rem)", { lineHeight: "1.1" }],
        "kiosk-5xl": ["clamp(3rem, 2.5vw + 2rem, 3.75rem)", { lineHeight: "1" }],
      },
      spacing: {
        "kiosk-touch": "60px",
        "kiosk-touch-lg": "72px",
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        // Safe area spacing
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      minHeight: {
        "touch": "60px",
        "touch-lg": "72px",
      },
      minWidth: {
        "touch": "60px",
        "touch-lg": "72px",
      },
      maxWidth: {
        "kiosk": "1080px",
        "kiosk-lg": "1920px",
      },
      height: {
        "screen-safe": "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        "cart-bar": "120px",
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
        "slide-up-enter": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down-exit": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(20px)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-up": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up-enter": "slide-up-enter 0.3s ease-out",
        "slide-down-exit": "slide-down-exit 0.2s ease-in",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-up": "scale-up 0.3s ease-out",
      },
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;