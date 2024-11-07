export const isValidTab = (url: string | undefined) =>
  url != null && url !== '' && isValidProtocol(url)

const isValidProtocol = (url: string) =>
  ['chrome:', 'about:'].every((protocol) => !url.startsWith(protocol))
