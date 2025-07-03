import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type GetWorkspacesOptions = {
  tenantId: UUID
}

export const getWorkspaces = (
  db: DBClient,
  { tenantId }: GetWorkspacesOptions,
) =>
  db.query.workspace.findMany({
    where(fields, { eq }) {
      return eq(fields.tenantId, tenantId)
    },
  })
