import { invariant } from '@epic-web/invariant'

export const getMoralisApiKey = () => {
  const MORALIS_API_KEY = process.env.MORALIS_API_KEY

  invariant(
    MORALIS_API_KEY != null,
    '"MORALIS_API_KEY" environment variable missing',
  )

  return MORALIS_API_KEY
}
