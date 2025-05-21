import { getWorkOS } from '@workos-inc/authkit-react-router'
import type { User } from '@workos-inc/node'

export const createPersonalOrganization = async (user: User) => {
  const workOS = getWorkOS()

  const organization = await workOS.organizations.createOrganization({
    name: `${user.firstName}'s Zodiac OS space`,
  })

  await workOS.userManagement.createOrganizationMembership({
    organizationId: organization.id,
    userId: user.id,
    roleSlug: 'admin',
  })

  return organization
}
