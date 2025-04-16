import { invariant } from '@epic-web/invariant'

export const getRolesAppUrl = () => {
  const ROLES_APP_URL = process.env.ROLES_APP_URL

  invariant(
    ROLES_APP_URL != null,
    '"ROLES_APP_URL" environment variable not set',
  )

  if (ROLES_APP_URL.endsWith('/')) {
    return ROLES_APP_URL.slice(0, ROLES_APP_URL.length - 1)
  }

  return ROLES_APP_URL
}
