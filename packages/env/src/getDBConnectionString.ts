import { invariant } from '@epic-web/invariant'

export const getDBConnectionString = () => {
  const POSTGRES_PRISMA_URL = process.env.POSTGRES_PRISMA_URL

  invariant(
    POSTGRES_PRISMA_URL != null,
    '"POSTGRES_PRISMA_URL" environment variable not found',
  )

  return POSTGRES_PRISMA_URL
}
