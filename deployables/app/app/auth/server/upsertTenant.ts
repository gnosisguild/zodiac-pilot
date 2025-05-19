import { updateExternalTenantId } from '@/workOS/server'
import { invariant } from '@epic-web/invariant'
import type { Organization } from '@workos-inc/node'
import { createTenant, getTenant, type DBClient } from '@zodiac/db'
import { isUUID } from '@zodiac/schema'

export const upsertTenant = async (
  db: DBClient,
  workOSOrganization: Organization,
) => {
  if (workOSOrganization.externalId == null) {
    const tenant = await createTenant(db, { name: workOSOrganization.name })

    await updateExternalTenantId({
      organizationId: workOSOrganization.id,
      externalId: tenant.id,
    })

    return tenant
  }

  invariant(isUUID(workOSOrganization.externalId), '"externalId" is not a UUID')

  return getTenant(db, workOSOrganization.externalId)
}
