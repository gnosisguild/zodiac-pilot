import { getCompanionAppUrl } from '@zodiac/env'

export type ValidityCheckOptions = {
  protocolCheckOnly?: boolean
}

export const isValidTab = (
  url?: string,
  { protocolCheckOnly = false }: ValidityCheckOptions = {},
) => {
  if (url == null || url === '') {
    return false
  }

  if (!isValidProtocol(url)) {
    return false
  }

  if (protocolCheckOnly) {
    return true
  }

  return isValidPage(url)
}

const isValidProtocol = (url: string) =>
  ['chrome:', 'about:'].every((protocol) => !url.startsWith(protocol))

const isValidPage = (url: string) =>
  !url.startsWith(`${getCompanionAppUrl()}/edit`) &&
  !url.startsWith(`${getCompanionAppUrl()}/create`) &&
  !url.startsWith(`${getCompanionAppUrl()}/submit`)
