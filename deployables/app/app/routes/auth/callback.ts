import { createUser, dbClient, getTenant } from '@/db'
import { getOrganizationForUser, updateExternalUserId } from '@/workOS'
import { invariantResponse } from '@epic-web/invariant'
import { authLoader } from '@workos-inc/authkit-remix'
import type { LoaderFunction } from 'react-router'

export const loader: LoaderFunction = authLoader({
  async onSuccess({ user: workOSUser }) {
    if (workOSUser.externalId != null) {
      return
    }

    await dbClient().transaction(async (db) => {
      const organization = await getOrganizationForUser(workOSUser.id)

      invariantResponse(
        organization.externalId != null,
        'WorkOS organization not known in Zodiac OS',
      )

      const tenant = await getTenant(db, organization.externalId)
      const user = await createUser(db, tenant)

      await updateExternalUserId({
        userId: workOSUser.id,
        externalId: user.id,
      })
    })
  },
})
