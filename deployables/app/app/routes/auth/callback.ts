import { upsertTenant, upsertUser } from '@/auth-server'
import { sentry } from '@/sentry-client'
import { getOrganizationsForUser } from '@/workOS/server'
import { authLoader, signOut } from '@workos-inc/authkit-react-router'
import { addUserToTenant, dbClient } from '@zodiac/db'
import type { Route } from './+types/callback'

export const loader = ({ request, ...options }: Route.LoaderArgs) => {
  const response = authLoader({
    returnPathname: '/',
    async onSuccess({ user: workOSUser }) {
      await dbClient().transaction(async (db) => {
        try {
          const [user, organizations] = await Promise.all([
            upsertUser(db, workOSUser),
            getOrganizationsForUser(workOSUser),
          ])

          await Promise.all(
            organizations.map(async (organization) => {
              const tenant = await upsertTenant(db, user, organization)

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
