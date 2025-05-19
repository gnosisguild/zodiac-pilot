import { invariant } from '@epic-web/invariant'
import { getWorkOS } from '@workos-inc/authkit-react-router'
import { type Organization } from '@workos-inc/node'
import { getOrganization } from './getOrganization'

export const getOrganizationsForUser = async (
  userId: string,
): Promise<Organization[]> => {
  const workOS = getWorkOS()

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
