import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getAccount } from '@zodiac/db'
import { isUUID, safeJson } from '@zodiac/schema'
import type { Route } from './+types/account'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { accountId },
      context: {
        auth: { user },
      },
    }) => {
      if (user == null) {
        return null
      }

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const account = await getAccount(dbClient(), accountId)

      // TODO: remove when 3.20.1 reaches saturation
      return safeJson(account, { noInternalRepresentation: true })
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
