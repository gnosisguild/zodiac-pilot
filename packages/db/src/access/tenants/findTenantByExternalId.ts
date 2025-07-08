import type { Tenant } from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'
import { verifyTenant } from './verifyTenant'

export const findTenantByExternalId = async (
  db: DBClient,
  externalId: string,
): Promise<Tenant | undefined> => {
  const tenant = await db.query.tenant.findFirst({
    where(fields, { eq }) {
      return eq(fields.externalId, externalId)
    },
  })

  if (tenant == null) {
    return tenant
  }

  return verifyTenant(tenant)
}
