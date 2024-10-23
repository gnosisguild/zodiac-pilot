/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        spectral: 'Sepctral',
      },
      colors: {
        zodiac: {
          'dark-blue': 'rgba(43, 34, 101, 0.08)',
          'light-blue': '#223265',

          'light-mustard': 'rgba(217, 212, 173)',
          'dark-mustard': '#3e3d2ad1',

          'dark-green': 'rgba(0, 166, 56, 0.47)',
        },
      },
    },
  },
  plugins: [],
}
