import { invariant } from '@epic-web/invariant'
import type { Tenant, TenantTable } from '@zodiac/db/schema'

export const verifyTenant = (
  tenant: typeof TenantTable.$inferSelect,
): Tenant => {
  const { defaultWorkspaceId, ...rest } = tenant

  invariant(defaultWorkspaceId != null, 'Default workspace id must not be null')

  return { ...rest, defaultWorkspaceId }
}
