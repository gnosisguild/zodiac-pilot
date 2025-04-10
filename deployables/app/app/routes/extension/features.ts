import { getOrganization } from '@/workOS/server'
import { authkitLoader } from '@workos-inc/authkit-react-router'
import { dbClient, getFeatures, getTenant } from '@zodiac/db'
import type { Route } from './+types/features'

export const loader = (args: Route.LoaderArgs) =>
  authkitLoader(args, async ({ auth: { organizationId } }) => {
    if (organizationId == null) {
      return { features: [] }
    }

    const db = dbClient()

    const organization = await getOrganization(organizationId)
    const tenant = await getTenant(dbClient(), organization.externalId)

    const features = await getFeatures(db, tenant.id)

    return { features: features.map(({ name }) => name) }
  })
