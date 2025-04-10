import { invariant } from '@epic-web/invariant'
import { WorkOS } from '@workos-inc/node'
import { getOrganization, type VerifiedOrganization } from './getOrganization'

export const getOrganizationsForUser = async (
  userId: string,
): Promise<VerifiedOrganization[]> => {
  const workOS = new WorkOS()

  const { data: memberships } =
    await workOS.userManagement.listOrganizationMemberships({
      userId,
    })

  invariant(
    memberships.length > 0,
    `User with id "${userId}" is not part of any organization`,
  )

  return Promise.all(
    memberships.map(({ organizationId }) => getOrganization(organizationId)),
  )
}
