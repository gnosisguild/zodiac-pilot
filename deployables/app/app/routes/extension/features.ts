import { dbClient, getFeatures, getTenant } from '@/db'
import { getOrganizationForUser } from '@/workOS'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import type { Route } from './+types/features'

export const loader = (args: Route.LoaderArgs) =>
  authkitLoader(args, async ({ auth: { user } }) => {
    if (user == null) {
      return { features: [] }
    }

    const db = dbClient()

    const organization = await getOrganizationForUser(user.id)
    const tenant = await getTenant(dbClient(), organization.externalId)

    const features = await getFeatures(db, tenant.id)

    return { features: features.map(({ name }) => name) }
  })
