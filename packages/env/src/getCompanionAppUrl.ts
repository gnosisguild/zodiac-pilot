import { invariant } from '@epic-web/invariant'

export const getCompanionAppUrl = () => {
  const { COMPANION_APP_URL } = process.env

  invariant(
    COMPANION_APP_URL != null,
    '"COMPANION_APP_URL" is missing from environment',
  )

  if (COMPANION_APP_URL.endsWith('/')) {
    return COMPANION_APP_URL.slice(0, COMPANION_APP_URL.length - 1)
  }

  return COMPANION_APP_URL
}
