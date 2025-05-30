/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0e17',
          'card-bg': '#141a26',
          'accent-primary': '#00ffff', // cyan
          'accent-secondary': '#ff00ff', // magenta
          'accent-tertiary': '#7928ca', // purple
          'text': '#e6e6e6',
          'muted-text': '#a0a0a0',
          'error': '#ff3e3e',
          'success': '#00ff66',
          'info': '#3a86ff',
          'border': '#2a3343'
        },
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'cyber': '0 0 10px rgba(0, 255, 255, 0.3)',
        'cyber-lg': '0 0 20px rgba(0, 255, 255, 0.4)',
        'cyber-error': '0 0 10px rgba(255, 0, 0, 0.3)',
        'cyber-success': '0 0 10px rgba(0, 255, 102, 0.3)',
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-flow': 'border-flow 2s linear infinite',
        'glitch': 'glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
    },
  },
  plugins: [],
}
