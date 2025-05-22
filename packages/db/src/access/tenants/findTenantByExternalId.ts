import type { DBClient } from '../../dbClient'

export const findTenantByExternalId = (db: DBClient, externalId: string) =>
  db.query.tenant.findFirst({
    where(fields, { eq }) {
      return eq(fields.externalId, externalId)
    },
  })
