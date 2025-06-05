import { authorizedLoader } from '@/auth-server'
import { parseTransactionData } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getAccount, proposeTransaction } from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import type { Route } from './+types/sign'

export const loader = async (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { transactions, accountId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(accountId), `"${accountId}" is not a UUID`)

      await proposeTransaction(dbClient(), {
        userId: user.id,
        tenantId: tenant.id,
        accountId,
        transaction: parseTransactionData(transactions),
      })
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { accountId } }) {
        invariantResponse(isUUID(accountId), `"${accountId}" is not a UUID`)

        const account = await getAccount(dbClient(), accountId)

        return account.tenantId === tenant.id
      },
    },
  )
