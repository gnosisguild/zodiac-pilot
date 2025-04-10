import { invariant } from '@epic-web/invariant'
import { getWorkOS } from '@workos-inc/authkit-react-router'
import type { Organization } from '@workos-inc/node'

export type VerifiedOrganization = Omit<Organization, 'externalId'> & {
  externalId: string
}

export const getOrganization = async (
  organizationId: string,
): Promise<VerifiedOrganization> => {
  const { externalId, ...organization } =
    await getWorkOS().organizations.getOrganization(organizationId)

  invariant(externalId != null, 'Organization does not exist in our system')

  return { ...organization, externalId }
}
