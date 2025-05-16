import { sentry } from '@/sentry-client'
import {
  getOrganizationsForUser,
  updateExternalTenantId,
  updateExternalUserId,
} from '@/workOS/server'
import { invariant } from '@epic-web/invariant'
import { authLoader, signOut } from '@workos-inc/authkit-react-router'
import type { Organization, User } from '@workos-inc/node'
import {
  addUserToTenant,
  createTenant,
  createUser,
  dbClient,
  getTenant,
  getUser,
  type DBClient,
} from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
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
              const tenant = await upsertTenant(db, organization)

              return addUserToTenant(db, tenant, user)
            }),
          )
        } catch (error) {
          sentry.captureException(error)

          console.error(error)

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

  invariant(isUUID(workOSUser.externalId), '"externalId" is not a UUID')

  return getUser(db, workOSUser.externalId)
}

const upsertTenant = async (db: DBClient, workOSOrganization: Organization) => {
  if (workOSOrganization.externalId == null) {
    const tenant = await createTenant(db, { name: workOSOrganization.name })

    await updateExternalTenantId({
      organizationId: workOSOrganization.id,
      externalId: tenant.id,
    })

    return tenant
  }

  invariant(isUUID(workOSOrganization.externalId), '"externalId" is not a UUID')

  return getTenant(db, workOSOrganization.externalId)
}
