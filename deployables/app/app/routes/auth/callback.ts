import { createUser, dbClient, getTenant } from '@/db'
import { invariantResponse } from '@epic-web/invariant'
import { authLoader } from '@workos-inc/authkit-remix'
import { WorkOS } from '@workos-inc/node'
import type { LoaderFunction } from 'react-router'

export const loader: LoaderFunction = authLoader({
  async onSuccess({ user: workOSUser }) {
    if (workOSUser.externalId != null) {
      return
    }

    const workOS = new WorkOS()

    const {
      data: [membership],
    } = await workOS.userManagement.listOrganizationMemberships({
      userId: workOSUser.id,
    })

    const organization = await workOS.organizations.getOrganization(
      membership.organizationId,
    )

    await dbClient().transaction(async (db) => {
      invariantResponse(
        organization.externalId != null,
        'WorkOS organization not known in Zodiac OS',
      )

      const tenant = await getTenant(db, organization.externalId)

      const user = await createUser(db, tenant)

      await workOS.userManagement.updateUser({
        userId: workOSUser.id,
        externalId: user.id,
      })
    })
  },
})
