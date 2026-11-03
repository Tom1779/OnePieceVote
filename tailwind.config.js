/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wanted-poster palette: posters pinned to a dark wooden board
        wood: {
          950: "#160f09",
          900: "#211710",
          800: "#2f2117",
          700: "#46321f",
          600: "#5e4429",
        },
        paper: {
          light: "#f7eed6",
          DEFAULT: "#efe1bf",
          dark: "#dcc699",
          edge: "#b8955e",
        },
        ink: {
          DEFAULT: "#2a1c0f",
          soft: "#574230",
          faint: "#8b7255",
        },
        blood: {
          DEFAULT: "#9b2a1d",
          dark: "#7a1f15",
        },
        brass: {
          DEFAULT: "#d4a24c",
          dark: "#a87a2c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'stutter-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(40deg)' },
          '15%': { transform: 'rotate(35deg)' }, /* Slight overshoot/jitter */
          '30%': { transform: 'rotate(120deg)' },
          '45%': { transform: 'rotate(115deg)' },
          '60%': { transform: 'rotate(240deg)' },
          '75%': { transform: 'rotate(235deg)' },
          '90%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        stamp: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(0.9) rotate(-2deg)' },
          '100%': { transform: 'scale(1)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, 12px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'stutter-spin': 'stutter-spin 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        stamp: 'stamp 0.35s ease-out',
        'toast-in': 'toast-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
