import { AccountTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

type MoveAccountOptions = {
  accountId: UUID
  targetWorkspaceId: UUID
}

export const moveAccount = (
  db: DBClient,
  { accountId, targetWorkspaceId }: MoveAccountOptions,
) =>
  db
    .update(AccountTable)
    .set({ workspaceId: targetWorkspaceId })
    .where(eq(AccountTable.id, accountId))
