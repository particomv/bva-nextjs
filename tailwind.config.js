/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3ff', 100: '#dbe1ff', 200: '#b5c2ff', 300: '#8a9eff',
          400: '#5c74ff', 500: '#3b52e0', 600: '#1e3a8a', 700: '#172e6e',
          800: '#112255', 900: '#0b1737',
        },
        accent: { gold: '#f59e0b', emerald: '#10b981', coral: '#f43f5e' }
      },
    },
  },
  plugins: [],
};
