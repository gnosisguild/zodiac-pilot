import { createUser, dbClient, getTenant } from '@/db'
import { getOrganizationForUser, updateExternalUserId } from '@/workOS'
import { authLoader } from '@workos-inc/authkit-react-router'

export const loader = authLoader({
  async onSuccess({ user: workOSUser }) {
    if (workOSUser.externalId != null) {
      return
    }

    await dbClient().transaction(async (db) => {
      const organization = await getOrganizationForUser(workOSUser.id)

      const tenant = await getTenant(db, organization.externalId)
      const user = await createUser(db, tenant)

      await updateExternalUserId({
        userId: workOSUser.id,
        externalId: user.id,
      })
    })
  },
})
