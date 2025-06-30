import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getAccount, getRoutes } from '@zodiac/db'
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

      return getRoutes(dbClient(), tenant.id, { userId: user.id, accountId })
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
