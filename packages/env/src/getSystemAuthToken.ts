import { invariant } from '@epic-web/invariant'

export const getSystemAuthToken = () => {
  const SYSTEM_AUTH_TOKEN = process.env.SYSTEM_AUTH_TOKEN

  invariant(
    SYSTEM_AUTH_TOKEN != null,
    '"SYSTEM_AUTH_TOKEN" environment variable not set',
  )

  return SYSTEM_AUTH_TOKEN
}
