import {
  addUserToTenant,
  createUser,
  dbClient,
  getTenant,
  getUser,
  type DBClient,
} from '@/db'
import { getOrganizationsForUser, updateExternalUserId } from '@/workOS/server'
import { authLoader, signOut } from '@workos-inc/authkit-react-router'
import type { User } from '@workos-inc/node'
import type { Route } from './+types/callback'

export const loader = ({ request, ...options }: Route.LoaderArgs) => {
  const response = authLoader({
    async onSuccess({ user: workOSUser }) {
      await dbClient().transaction(async (db) => {
        try {
          const [user, organizations] = await Promise.all([
            upsertUser(db, workOSUser),
            getOrganizationsForUser(workOSUser.id),
          ])

          await Promise.all(
            organizations.map(async (organization) => {
              const tenant = await getTenant(db, organization.externalId)

              return addUserToTenant(db, tenant, user)
            }),
          )
        } catch {
          throw await signOut(request)
        }
      })
    },
  })

  return response({ request, ...options })
}

const upsertUser = async (db: DBClient, workOSUser: User) => {
  if (workOSUser.externalId == null) {
    const user = await createUser(db)

    await updateExternalUserId({
      userId: workOSUser.id,
      externalId: user.id,
    })

    return user
  }

  return getUser(db, workOSUser.externalId)
}
