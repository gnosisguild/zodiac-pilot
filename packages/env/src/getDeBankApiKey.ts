import { invariant } from '@epic-web/invariant'

export const getDeBankApiKey = () => {
  const DEBANK_API_KEY = process.env.DEBANK_API_KEY

  invariant(
    DEBANK_API_KEY != null,
    '"DEBANK_API_KEY" environment variable missing',
  )

  return DEBANK_API_KEY
}
