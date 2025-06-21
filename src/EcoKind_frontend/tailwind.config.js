/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        slate: {
          850: '#1e293b',
          950: '#0f172a',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 0 0 rgba(16, 185, 129, 0.4)'
          },
          '50%': {
            'box-shadow': '0 0 0 20px rgba(16, 185, 129, 0)'
          }
        },
        'gradient-shift': {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          }
        },
        'float': {
          '0%, 100%': {
            'transform': 'translateY(0px)'
          },
          '50%': {
            'transform': 'translateY(-20px)'
          }
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};