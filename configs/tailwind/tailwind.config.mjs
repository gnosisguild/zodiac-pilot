/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{tsx,html}',
    './app/**/*.tsx',
    './public/*.html',
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
