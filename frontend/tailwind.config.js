/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ds: {
          base: '#080c14',
          panel: '#0a0e1a',
          bar: '#0e1424',
          card: '#111728',
          input: '#131b2e',
          raised: '#12192c',
          editor: '#05080f',
          dock: '#04060b',
          border: '#1e293b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
