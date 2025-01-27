import { getCompanionAppUrl } from '@zodiac/env'

export const isValidTab = (url: string | undefined) =>
  url != null && url !== '' && isValidProtocol(url) && isValidPage(url)

const isValidProtocol = (url: string) =>
  ['chrome:', 'about:'].every((protocol) => !url.startsWith(protocol))

const isValidPage = (url: string) =>
  !url.startsWith(`${getCompanionAppUrl()}/edit-route`) &&
  !url.startsWith(`${getCompanionAppUrl()}/connect`)
