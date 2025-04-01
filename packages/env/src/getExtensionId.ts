import { invariant } from '@epic-web/invariant'

export const getExtensionId = () => {
  const PILOT_EXTENSION_ID = process.env.PILOT_EXTENSION_ID

  invariant(
    PILOT_EXTENSION_ID != null,
    '"PILOT_EXTENSION_ID" environment variable missing',
  )

  return PILOT_EXTENSION_ID
}
