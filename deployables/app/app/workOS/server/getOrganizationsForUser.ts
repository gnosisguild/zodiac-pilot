import { getWorkOS } from '@workos-inc/authkit-react-router'
import { type Organization, type User } from '@workos-inc/node'
import { getOrganization } from './getOrganization'

export const getOrganizationsForUser = async (
  user: User,
): Promise<Organization[]> => {
  const workOS = getWorkOS()

  const { data: memberships } =
    await workOS.userManagement.listOrganizationMemberships({
      userId: user.id,
    })

  if (memberships.length === 0) {
    const organization = await workOS.organizations.createOrganization({
      name: `${user.firstName}'s Zodiac OS space`,
    })

    await workOS.userManagement.createOrganizationMembership({
      organizationId: organization.id,
      userId: user.id,
      roleSlug: 'admin',
    })

    return [organization]
  }

  return Promise.all(
    memberships.map(({ organizationId }) => getOrganization(organizationId)),
  )
}
