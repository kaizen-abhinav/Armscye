/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f7f9',
          100: '#eceff2',
          200: '#d5dae2',
          300: '#b0baca',
          400: '#8393ad',
          500: '#627393',
          600: '#4d5c78',
          700: '#3e4a62',
          800: '#363f53',
          900: '#1e2430',
          950: '#11151c',
        },
        gold: {
          500: '#d4af37',
          600: '#b8972e',
        },
        emerald: {
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
