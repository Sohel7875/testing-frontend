/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stake-style dark palette
        stake: {
          900: '#0f212e', // page background
          850: '#152736', // deep panel
          800: '#1a2c38', // navbar / sidebar / panels
          700: '#213743', // cards
          650: '#2a3f4d',
          600: '#2f4553', // hover / borders
          500: '#557086', // muted separators
          text:  '#b1bad3', // muted text
          green: '#00e701',
          greenh:'#00c400',
          blue:  '#1475e1',
          blueh: '#1268c9',
          coin:  '#e9b83a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 6px 16px -4px rgba(0,0,0,0.5)',
        pop:  '0 12px 40px -8px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'pop-in':  { '0%': { opacity: 0, transform: 'translateY(8px) scale(.98)' }, '100%': { opacity: 1, transform: 'translateY(0) scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in .15s ease-out',
        'pop-in':  'pop-in .18s ease-out',
      },
    },
  },
  plugins: [],
}
