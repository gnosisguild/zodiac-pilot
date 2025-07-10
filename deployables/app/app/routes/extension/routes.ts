import { authorizedLoader } from '@/auth-server'
import { invariant, invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getAccount,
  getRoutes,
  getWallets,
  toExecutionRoute,
} from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import type { Route } from './+types/routes'

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
        return []
      }

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const [routes, account, wallets] = await Promise.all([
        getRoutes(dbClient(), tenant.id, { userId: user.id, accountId }),
        getAccount(dbClient(), accountId),
        getWallets(dbClient(), user.id),
      ])

      return routes.map((route) => {
        const wallet = wallets.find((wallet) => wallet.id === route.fromId)

        invariant(
          wallet != null,
          `Could not find wallet with id "${route.fromId}"`,
        )

        return toExecutionRoute({ wallet, account, route })
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
