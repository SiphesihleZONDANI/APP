/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        safeher: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d1d9',
          300: '#f4abbb',
          400: '#ec7893',
          500: '#df496e',
          600: '#cc2f55',
          700: '#ab2142',
          800: '#8e1e38',
          900: '#771d33',
        },
        emergency: {
          light: '#ff4d4d',
          DEFAULT: '#dc2626',
          dark: '#991b1b',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
