/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d7eaff',
          200: '#afd3ff',
          300: '#7bb3ff',
          400: '#3e8dff',
          500: '#1d6fee',
          600: '#104fd0',
          700: '#0d3fa8',
          800: '#103784',
          900: '#132f69',
        },
      },
    },
  },
  plugins: [],
};
