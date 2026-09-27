/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#17324D',
          blue: '#046A38',
          gold: '#FF671F', // UIDAI saffron
          green: '#046A38', // UIDAI green
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          dark: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        indic: ['Noto Sans Devanagari', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
