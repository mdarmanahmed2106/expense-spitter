/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark theme colors
        dark: {
          950: '#0a0a0a',
          900: '#121212',
          850: '#1a1a1a',
          800: '#1f1f1f',
          700: '#2a2a2a',
          600: '#3a3a3a',
        },
        // Neon accent colors from reference
        neon: {
          lime: '#a3e635',
          'lime-dark': '#84cc16',
          orange: '#fb923c',
          'orange-dark': '#f97316',
          pink: '#ec4899',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
        // Keep old colors for compatibility
        accent: {
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          blue: '#3b82f6',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-lime': 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
        'gradient-orange': 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-lime': 'glowLime 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' },
        },
        glowLime: {
          '0%': { boxShadow: '0 0 10px rgba(163, 230, 53, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(163, 230, 53, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-lime': '0 0 20px rgba(163, 230, 53, 0.3)',
        'neon-orange': '0 0 20px rgba(251, 146, 60, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
