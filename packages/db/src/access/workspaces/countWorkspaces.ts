import { WorkspaceTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

type CountWorkspacesOptions = {
  tenantId?: UUID
}

export const countWorkspaces = (
  db: DBClient,
  { tenantId }: CountWorkspacesOptions = {},
) => {
  let where

  if (tenantId != null) {
    where = eq(WorkspaceTable.tenantId, tenantId)
  }

  return db.$count(WorkspaceTable, where)
}
