import { getWorkOS } from '@workos-inc/authkit-react-router'

type CreateOrganizationOptions = {
  name: string
  externalId: string
  adminEmail: string
}

export const createOrganization = async ({
  name,
  externalId,
  adminEmail,
}: CreateOrganizationOptions) => {
  const workOS = getWorkOS()

  const organization = await workOS.organizations.createOrganization({
    name,
    externalId,
  })

  try {
    await workOS.userManagement.sendInvitation({
      email: adminEmail,
      organizationId: organization.id,
      roleSlug: 'admin',
    })
  } catch (e) {
    await workOS.organizations.deleteOrganization(organization.id)

    throw e
  }
}
