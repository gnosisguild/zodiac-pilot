import { authorizedLoader } from '@/auth-server'
import { dbClient, getAccounts } from '@zodiac/db'
import { safeJson } from '@zodiac/schema'
import type { Route } from './+types/accounts'

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

      const accounts = await getAccounts(dbClient(), { tenantId: tenant.id })

      return safeJson(accounts)
    },
  )
