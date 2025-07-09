import { getCompanionAppUrl } from '@zodiac/env'

export const isCompanionApp = (url?: string) => {
  if (url == null) {
    return false
  }

  if (url.startsWith(getCompanionAppUrl()) === false) {
    return false
  }

  return (
    url.includes('/submit') ||
    url.includes('/accounts') ||
    url.includes('/create')
  )
}
