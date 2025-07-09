import { AccountTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

type MoveAccountsOptions = {
  originWorkspaceId: UUID
  targetWorkspaceId: UUID
}

export const moveAccounts = (
  db: DBClient,
  { originWorkspaceId, targetWorkspaceId }: MoveAccountsOptions,
) =>
  db
    .update(AccountTable)
    .set({ workspaceId: targetWorkspaceId })
    .where(eq(AccountTable.workspaceId, originWorkspaceId))
