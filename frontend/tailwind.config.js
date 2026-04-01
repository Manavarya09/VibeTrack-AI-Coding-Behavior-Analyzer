/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        surface: { 1: '#fafaf9', 2: '#f5f5f4', 3: '#e7e5e4' },
        accent: { DEFAULT: '#b45309', light: '#d97706', subtle: '#fef3c7' },
        flow: '#6d28d9',
      },
    },
  },
  plugins: [],
}
