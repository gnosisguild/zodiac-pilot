import { invariant } from '@epic-web/invariant'

export const getTenderlyCredentials = () => {
  const TENDERLY_ACCESS_KEY = process.env.TENDERLY_ACCESS_KEY
  const TENDERLY_PROJECT = process.env.TENDERLY_PROJECT
  const TENDERLY_USER = process.env.TENDERLY_USER

  invariant(
    TENDERLY_ACCESS_KEY != null,
    '"TENDERLY_ACCESS_KEY" environment variable missing',
  )
  invariant(
    TENDERLY_PROJECT != null,
    '"TENDERLY_PROJECT" environment variable missing',
  )
  invariant(
    TENDERLY_USER != null,
    '"TENDERLY_USER" environment variable missing',
  )

  return { TENDERLY_ACCESS_KEY, TENDERLY_PROJECT, TENDERLY_USER }
}
