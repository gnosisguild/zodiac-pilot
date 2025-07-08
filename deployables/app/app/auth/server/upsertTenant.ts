import type { Organization } from '@workos-inc/node'
import { createTenant, findTenantByExternalId, type DBClient } from '@zodiac/db'
import type { Tenant, User } from '@zodiac/db/schema'

export const upsertTenant = async (
  db: DBClient,
  createdBy: User,
  workOSOrganization: Organization,
): Promise<Tenant> => {
  const existingTenant = await findTenantByExternalId(db, workOSOrganization.id)

  if (existingTenant != null) {
    return existingTenant
  }

  return createTenant(db, {
    name: workOSOrganization.name,
    externalId: workOSOrganization.id,
    createdBy,
  })
}
