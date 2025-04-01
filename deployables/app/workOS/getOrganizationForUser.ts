import { invariant } from '@epic-web/invariant'
import { WorkOS, type Organization } from '@workos-inc/node'

type VerifiedOrganization = Omit<Organization, 'externalId'> & {
  externalId: string
}

export const getOrganizationForUser = async (
  userId: string,
): Promise<VerifiedOrganization> => {
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

  const { externalId, ...organization } =
    await workOS.organizations.getOrganization(membership.organizationId)

  invariant(externalId != null, 'WorkOS organization not known in Zodiac OS')

  return { ...organization, externalId }
}
