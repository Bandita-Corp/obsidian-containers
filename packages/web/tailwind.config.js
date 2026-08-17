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
        bg: {
          base: '#0a0e17',
          surface: '#111827',
          card: '#162032',
          'card-hover': '#1c2942',
          input: '#0e1524',
          active: 'rgba(139, 92, 246, 0.16)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          focus: '#8b5cf6',
          strong: 'rgba(255, 255, 255, 0.16)',
        },
        brand: {
          purple: '#8b5cf6',
          'purple-hover': '#7c3aed',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(139, 92, 246, 0.25)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.25)',
        'glow-rose': '0 0 20px rgba(239, 68, 68, 0.25)',
        card: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.2s ease-out',
      }
    },
  },
  plugins: [],
}
