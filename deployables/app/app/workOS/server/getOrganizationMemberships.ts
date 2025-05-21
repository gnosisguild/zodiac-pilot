import { getWorkOS } from '@workos-inc/authkit-react-router'
import type { User } from '@workos-inc/node'

export const getOrganizationMemberships = async (user: User) => {
  const { data: memberships } =
    await getWorkOS().userManagement.listOrganizationMemberships({
      userId: user.id,
    })

  return memberships
}
