import { WorkspaceTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const updateWorkspaceLabel = (
  db: DBClient,
  workspaceId: UUID,
  label: string,
) =>
  db
    .update(WorkspaceTable)
    .set({ label })
    .where(eq(WorkspaceTable.id, workspaceId))
    .returning()
