import { authorizedAction } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getAccount, proposeTransaction } from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import { isUUID, metaTransactionRequestSchema } from '@zodiac/schema'
import type { Route } from './+types/propose-transaction'

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { accountId },
      context: {
        auth: { user, tenant },
      },
    }) => {
      invariantResponse(isUUID(accountId), 'accountId is not a UUID')

      const data = await request.formData()

      const proposal = await proposeTransaction(dbClient(), {
        userId: user.id,
        tenantId: tenant.id,
        accountId,
        transaction: metaTransactionRequestSchema
          .array()
          .parse(JSON.parse(getString(data, 'transaction'))),
      })

      return { proposalId: proposal.id }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { accountId }, tenant }) {
        invariantResponse(isUUID(accountId), 'accountId is not a UUID')

        const account = await getAccount(dbClient(), accountId)

        return account.tenantId === tenant.id
      },
    },
  )
