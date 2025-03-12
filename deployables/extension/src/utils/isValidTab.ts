export const isValidTab = (url?: string) => {
  if (url == null || url === '') {
    return false
  }

  if (!isValidProtocol(url)) {
    return false
  }

  return true
}

const isValidProtocol = (url: string) =>
  ['chrome:', 'about:'].every((protocol) => !url.startsWith(protocol))
