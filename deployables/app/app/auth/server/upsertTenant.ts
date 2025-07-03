import type { Organization } from '@workos-inc/node'
import { createTenant, findTenantByExternalId, type DBClient } from '@zodiac/db'
import type { User } from '@zodiac/db/schema'

export const upsertTenant = async (
  db: DBClient,
  createdBy: User,
  workOSOrganization: Organization,
) => {
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
