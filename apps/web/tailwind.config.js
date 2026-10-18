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
        charcoal: {
          950: '#090a0f',
          900: '#11131a',
          850: '#161922',
          800: '#1c1f2b',
          700: '#272b3c',
          600: '#383d54',
        },
        ivory: {
          50: '#faf8f5',
          100: '#f3efe6',
          200: '#e5decfe',
          300: '#ccc2ad',
          400: '#9b9484',
          500: '#6d6759',
        },
        verse: {
          violet: '#8b7cf6',
          indigo: '#6366f1',
          rose: '#f43f5e',
          amber: '#f59e0b',
          teal: '#14b8a6',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', '"Noto Serif Devanagari"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        devanagari: ['"Noto Serif Devanagari"', '"Rozha One"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}

