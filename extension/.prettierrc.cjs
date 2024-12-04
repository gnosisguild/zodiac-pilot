/** @type {import("prettier").Options} */
// eslint-disable-next-line no-undef
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  plugins: [
    // eslint-disable-next-line no-undef
    require.resolve('prettier-plugin-organize-imports'),
    // eslint-disable-next-line no-undef
    require.resolve('prettier-plugin-tailwindcss'),
  ],
}
