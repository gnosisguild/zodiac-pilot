import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  findDefaultRoute,
  getAccount,
  getRoute,
  getWallet,
  toExecutionRoute,
} from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
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

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const defaultRoute = await findDefaultRoute(
        dbClient(),
        tenant,
        user,
        accountId,
      )

      if (defaultRoute == null) {
        return null
      }

      const [route, account] = await Promise.all([
        getRoute(dbClient(), defaultRoute.routeId),
        getAccount(dbClient(), defaultRoute.accountId),
      ])

      return toExecutionRoute({
        wallet: await getWallet(dbClient(), route.fromId),
        account,
        route,
      })
    },
    {
      async hasAccess({ tenant, params: { accountId } }) {
        if (tenant == null) {
          return true
        }

        invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

        const account = await getAccount(dbClient(), accountId)

        return account.tenantId === tenant.id
      },
    },
  )
