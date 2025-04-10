import { authorizedLoader } from '@/auth'
import { dbClient, getFeatures } from '@zodiac/db'
import type { Route } from './+types/features'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return []
      }

      const db = dbClient()

      return await getFeatures(db, tenant.id)
    },
  )
