import { authorizedLoader } from '@/auth'
import { dbClient, getAccount, getActiveRoute } from '@zodiac/db'
import type { Route } from './+types/activeRoute'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { accountId },
      context: {
        auth: { user, tenant },
      },
    }) => {
      if (user == null) {
        return null
      }

      return await getActiveRoute(dbClient(), tenant, user, accountId)
    },
    {
      async hasAccess({ tenant, params: { accountId } }) {
        if (tenant == null) {
          return true
        }

        const account = await getAccount(dbClient(), accountId)

        return account.tenantId === tenant.id
      },
    },
  )
