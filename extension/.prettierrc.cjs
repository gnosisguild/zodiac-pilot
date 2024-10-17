/** @type {import("prettier").Options} */
// eslint-disable-next-line no-undef
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  // eslint-disable-next-line no-undef
  plugins: [require.resolve('prettier-plugin-organize-imports')],
}
