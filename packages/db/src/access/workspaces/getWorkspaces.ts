import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type GetWorkspacesOptions = {
  tenantId: UUID
  deleted?: boolean
}

export const getWorkspaces = (
  db: DBClient,
  { tenantId, deleted = false }: GetWorkspacesOptions,
) =>
  db.query.workspace.findMany({
    where(fields, { eq, and }) {
      return and(eq(fields.tenantId, tenantId), eq(fields.deleted, deleted))
    },
    with: { createdBy: true },
  })
