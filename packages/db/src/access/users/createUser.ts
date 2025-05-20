import { UserTable } from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'

type UserCreateOptions = {
  fullName: string
}

export const createUser = async (
  db: DBClient,
  { fullName }: UserCreateOptions,
) => {
  const [user] = await db.insert(UserTable).values({ fullName }).returning()

  return user
}
