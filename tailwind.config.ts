import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern-Retro Professional Color Palette
        primary: {
          50: "#fef7f0",
          100: "#fdeee1",
          200: "#fadbc3",
          300: "#f5c191",
          400: "#ee9d5e",
          500: "#e57c23", // Main accent color - Orange Burnt
          600: "#d16819",
          700: "#ae5115",
          800: "#8b4118",
          900: "#713716",
        },
        // Design System Colors
        background: "#F8F5F2", // Off-white background
        foreground: "#333333", // Dark gray text
        card: {
          DEFAULT: "#ffffff", // Pure white for cards
          foreground: "#333333",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#e57c23",
      },
      fontFamily: {
        // Typography System
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"], // Body text
        serif: ["Playfair Display", "ui-serif", "Georgia", "serif"], // Headings
      },
      fontSize: {
        // Typography Scale
        'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      spacing: {
        // Modern spacing system
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        // Enhanced shadows for modern-retro feel
        'retro': '0 10px 25px -3px rgba(229, 124, 35, 0.1), 0 4px 6px -2px rgba(229, 124, 35, 0.05)',
        'retro-lg': '0 20px 40px -4px rgba(229, 124, 35, 0.15), 0 8px 16px -4px rgba(229, 124, 35, 0.1)',
      },
      animation: {
        // Smooth animations
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
