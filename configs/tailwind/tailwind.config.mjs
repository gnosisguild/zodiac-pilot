/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.tsx',
    './public/*.html',
    './src/**/*.html',
    './node_modules/@zodiac/ui/**/*.tsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      },
    },
  },
  plugins: [],
}
