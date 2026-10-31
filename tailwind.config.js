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
        dnd: {
          red: '#8B0000',
          darkred: '#580000',
          gold: '#C59B27',
          lightgold: '#E5C158',
          dark: '#121316',
          darker: '#0a0a0c',
          panel: '#1A1C23',
          border: '#2E323D',
          hover: '#2A2D3A',
          parchment: '#F5E6C8',
          parchmentDark: '#E2CEAA'
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
