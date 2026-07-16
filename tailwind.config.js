/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        navy: '#1B0750',
        teal: {
          DEFAULT: '#74C3B7',
          dark: '#5BA99D',
          light: '#E8F5F3',
        },
        brand: {
          purple: '#7C3AED',
          light: '#F3F0FF',
        }
      }
    },
  },
  plugins: [],
}
