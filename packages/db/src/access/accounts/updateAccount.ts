import { AccountTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

type UpdateAccountOptions = {
  label?: string
}

export const updateAccount = (
  db: DBClient,
  accountId: UUID,
  { label }: UpdateAccountOptions,
) =>
  db.update(AccountTable).set({ label }).where(eq(AccountTable.id, accountId))
