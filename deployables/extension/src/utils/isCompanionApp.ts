import { getCompanionAppUrl } from '@zodiac/env'

export const isCompanionApp = (url?: string) => {
  if (url == null) {
    return false
  }

  return (
    url.startsWith(`${getCompanionAppUrl()}/edit`) ||
    url.startsWith(`${getCompanionAppUrl()}/create`) ||
    url.startsWith(`${getCompanionAppUrl()}/submit`)
  )
}
