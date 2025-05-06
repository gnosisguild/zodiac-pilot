import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getTenant = async (db: DBClient, tenantId: UUID) => {
  const tenant = await db.query.tenant.findFirst({
    where: ({ id }, { eq }) => eq(id, tenantId),
  })

  invariant(tenant != null, `Could not find tenant with id "${tenantId}"`)

  return tenant
}
