import { type Organization, type User } from '@workos-inc/node'
import { createPersonalOrganization } from './createPersonalOrganization'
import { getOrganization } from './getOrganization'
import { getOrganizationMemberships } from './getOrganizationMemberships'

export const getOrganizationsForUser = async (
  user: User,
): Promise<Organization[]> => {
  const memberships = await getOrganizationMemberships(user)

  if (memberships.length === 0) {
    const organization = await createPersonalOrganization(user)

    return [organization]
  }

  return Promise.all(
    memberships.map(({ organizationId }) => getOrganization(organizationId)),
  )
}
