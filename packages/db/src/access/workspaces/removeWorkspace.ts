import { WorkspaceTable, type User } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const removeWorkspace = (db: DBClient, user: User, workspaceId: UUID) =>
  db
    .update(WorkspaceTable)
    .set({ deleted: true, deletedAt: new Date(), deletedById: user.id })
    .where(eq(WorkspaceTable.id, workspaceId))
