import { addUserToTenant, createUser, dbClient, getTenant } from '@/db'
import { getOrganizationForUser, updateExternalUserId } from '@/workOS/server'
import { authLoader, signOut } from '@workos-inc/authkit-react-router'
import type { Route } from './+types/callback'

export const loader = ({ request, ...options }: Route.LoaderArgs) => {
  const response = authLoader({
    async onSuccess({ user: workOSUser }) {
      if (workOSUser.externalId != null) {
        return
      }

      await dbClient().transaction(async (db) => {
        const organization = await getOrganizationForUser(workOSUser.id)

        try {
          const tenant = await getTenant(db, organization.externalId)
          const user = await createUser(db)

          await addUserToTenant(db, tenant, user)

          await updateExternalUserId({
            userId: workOSUser.id,
            externalId: user.id,
          })
        } catch {
          throw await signOut(request)
        }
      })
    },
  })

  return response({ request, ...options })
}
