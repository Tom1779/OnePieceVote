/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'stutter-spin': 'stutter-spin 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
