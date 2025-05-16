import { WorkOS } from '@workos-inc/node'
import type { UUID } from 'crypto'

type UpdateExternalTenantIdOptions = {
  organizationId: string
  externalId: UUID
}

export const updateExternalTenantId = ({
  organizationId,
  externalId,
}: UpdateExternalTenantIdOptions) =>
  new WorkOS().organizations.updateOrganization({
    organization: organizationId,
    externalId,
  })
