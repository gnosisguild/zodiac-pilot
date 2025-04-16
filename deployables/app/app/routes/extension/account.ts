import { authorizedLoader } from '@/auth'
import { dbClient, getAccount } from '@zodiac/db'
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

      return await getAccount(dbClient(), accountId)
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
