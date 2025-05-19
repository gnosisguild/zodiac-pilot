import { getWorkOS } from '@workos-inc/authkit-react-router'
import type { UUID } from 'crypto'

type UpdateExternalTenantIdOptions = {
  organizationId: string
  externalId: UUID
}

export const updateExternalTenantId = ({
  organizationId,
  externalId,
}: UpdateExternalTenantIdOptions) =>
  getWorkOS().organizations.updateOrganization({
    organization: organizationId,
    externalId,
  })
