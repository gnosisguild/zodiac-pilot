import { invariant } from '@epic-web/invariant'
import { getWorkOS } from '@workos-inc/authkit-react-router'
import type { Organization } from '@workos-inc/node'
import { isUUID } from '@zodiac/schema'
import type { UUID } from 'crypto'

export type VerifiedOrganization = Omit<Organization, 'externalId'> & {
  externalId: UUID
}

export const getOrganization = async (
  organizationId: string,
): Promise<VerifiedOrganization> => {
  const { externalId, ...organization } =
    await getWorkOS().organizations.getOrganization(organizationId)

  invariant(externalId != null, 'Organization does not exist in our system')
  invariant(isUUID(externalId), 'External ID is not a UUID')

  return { ...organization, externalId }
}
