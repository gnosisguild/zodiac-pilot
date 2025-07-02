import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getAccount,
  getRoute,
  getWallet,
  toExecutionRoute,
} from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import type { Route } from './+types/route'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { routeId },
      context: {
        auth: { user },
      },
    }) => {
      if (user == null) {
        return null
      }

      invariantResponse(isUUID(routeId), '"routeId" is not a UUID')

      const route = await getRoute(dbClient(), routeId)
      const [wallet, account] = await Promise.all([
        getWallet(dbClient(), route.fromId),
        getAccount(dbClient(), route.toId),
      ])

      return toExecutionRoute({ wallet, account, route })
    },
    {
      async hasAccess({ tenant, params: { routeId } }) {
        if (tenant == null) {
          return true
        }

        invariantResponse(isUUID(routeId), '"routeId" is not a UUID')

        const route = await getRoute(dbClient(), routeId)

        return route.tenantId === tenant.id
      },
    },
  )
