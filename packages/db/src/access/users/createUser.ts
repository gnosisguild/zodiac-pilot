import { UserTable } from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'

type UserCreateOptions = {
  fullName: string
  externalId: string
}

export const createUser = async (
  db: DBClient,
  { fullName, externalId }: UserCreateOptions,
) => {
  const [user] = await db
    .insert(UserTable)
    .values({ fullName, externalId })
    .returning()

  return user
}
