/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pa: {
          cream: '#F6F0E6',
          paper: '#FFFCF7',
          ink: '#1C1917',
          muted: '#78716C',
          forest: '#2F5D50',
          forestDark: '#23463C',
          sage: '#A3B18A',
          rose: '#C45C4A',
          gold: '#D4A373',
          sand: '#EDE4D4',
        },
      },
      boxShadow: {
        card: '0 10px 40px rgba(35, 70, 60, 0.08)',
        soft: '0 2px 16px rgba(28, 25, 23, 0.05)',
      },
      fontFamily: {
        display: ['"Iowan Old Style"', 'Palatino', 'Georgia', 'serif'],
        sans: ['ui-rounded', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
