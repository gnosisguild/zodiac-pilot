import { invariant } from '@epic-web/invariant'
import { WorkOS } from '@workos-inc/node'

export const getOrganizationForUser = async (userId: string) => {
  const workOS = new WorkOS()

  const {
    data: [membership],
  } = await workOS.userManagement.listOrganizationMemberships({
    userId,
  })

  invariant(
    membership != null,
    `User with id "${userId}" is not part of any organization`,
  )

  return workOS.organizations.getOrganization(membership.organizationId)
}
