/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af', // A deep blue
        secondary: '#3b82f6', // A lighter, vibrant blue
        accent: '#f97316', // A warm orange
        background: '#f8fafc', // A very light gray
        surface: '#ffffff', // White
        textPrimary: '#1f2937', // Dark gray for text
        textSecondary: '#6b7280', // Lighter gray for secondary text
        error: '#dc2626', // Red for errors
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'widget': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}