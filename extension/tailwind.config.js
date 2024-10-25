/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.tsx', './public/*.html'],
  theme: {
    extend: {
      fontFamily: {
        spectral: 'Sepctral',
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      },
      colors: {
        zodiac: {
          'dark-blue': 'rgba(43, 34, 101, 0.08)',
          'light-blue': '#223265',

          'light-mustard': 'rgba(217, 212, 173)',
          'dark-mustard': '#3e3d2ad1',

          'dark-green': 'rgba(0, 166, 56, 0.47)',

          'light-red': 'rgba(220, 20, 60)',

          'very-dark-blue': 'rgba(39, 38, 30)',
        },
      },
    },
  },
  plugins: [],
}
