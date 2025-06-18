import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getAccount, proposeTransaction } from '@zodiac/db'
import { isUUID, parseTransactionData } from '@zodiac/schema'
import { href, redirect } from 'react-router'
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

      const proposal = await proposeTransaction(dbClient(), {
        userId: user.id,
        tenantId: tenant.id,
        accountId,
        transaction: parseTransactionData(transactions),
      })

      return redirect(
        href('/submit/proposal/:proposalId', { proposalId: proposal.id }),
      )
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
