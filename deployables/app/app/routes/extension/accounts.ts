import { authorizedLoader } from '@/auth-server'
import { dbClient, getAccounts } from '@zodiac/db'
import type { Route } from './+types/accounts'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant, user },
      },
    }) => {
      if (tenant == null || user == null) {
        return []
      }

      return getAccounts(dbClient(), { tenantId: tenant.id, userId: user.id })
    },
  )
