import { getWorkOS } from '@workos-inc/authkit-react-router'
import type { Organization } from '@workos-inc/node'

export const getOrganization = async (
  organizationId: string,
): Promise<Organization> =>
  getWorkOS().organizations.getOrganization(organizationId)
