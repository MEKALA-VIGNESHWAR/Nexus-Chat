/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode (our default)
  theme: {
    extend: {
      colors: {
        // Sleek dark-mode palette
        chat: {
          bg: '#0f172a',        // Slate 900
          sidebar: '#0b0f19',   // Very dark slate
          window: '#1e293b',    // Slate 800
          bubbleSelf: '#6366f1',// Indigo 500
          bubblePeer: '#334155',// Slate 700
          active: '#4f46e5',    // Indigo 600
          hover: '#1e293b',
          border: '#1e293b',
        },
        brand: {
          primary: '#6366f1',   // Indigo
          secondary: '#a855f7', // Purple
          success: '#10b981',   // Emerald
          warning: '#f59e0b',   // Amber
          danger: '#ef4444',    // Red
          online: '#22c55e',    // Green
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'premium': '0 4px 20px 0 rgba(0, 0, 0, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
