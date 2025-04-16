import { authorizedLoader } from '@/auth'
import {
  dbClient,
  findActiveRoute,
  getAccount,
  toExecutionRoute,
} from '@zodiac/db'
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

      const activeRoute = await findActiveRoute(
        dbClient(),
        tenant,
        user,
        accountId,
      )

      if (activeRoute == null) {
        return null
      }

      const { account, route } = activeRoute

      if (route.waypoints == null) {
        return null
      }

      return toExecutionRoute({
        wallet: route.wallet,
        account: account,
        waypoints: route.waypoints,
      })
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
