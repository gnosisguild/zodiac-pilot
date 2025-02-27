export const regexEscape = (value: string): string =>
  value.replace(/[()[\]{}*+?^$|#.,/\\\s-]/g, '\\$&')
