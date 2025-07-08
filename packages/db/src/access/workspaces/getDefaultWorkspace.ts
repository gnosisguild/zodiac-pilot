import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getDefaultWorkspace = async (db: DBClient, tenantId: UUID) => {
  const defaultWorkspace = await db.query.workspace.findFirst({
    where(fields, { eq, and }) {
      return and(eq(fields.tenantId, tenantId), eq(fields.deleted, false))
    },
    orderBy(fields, { asc }) {
      return asc(fields.label)
    },
  })

  invariant(
    defaultWorkspace != null,
    `Tenant "${tenantId}" does not have a default workspace`,
  )

  return defaultWorkspace
}
