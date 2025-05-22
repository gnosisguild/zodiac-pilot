import { UserTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

type UpdateUserOptions = {
  fullName: string
}

export const updateUser = async (
  db: DBClient,
  userId: UUID,
  { fullName }: UpdateUserOptions,
) => {
  const [user] = await db
    .update(UserTable)
    .set({ fullName })
    .where(eq(UserTable.id, userId))
    .returning()

  return user
}
