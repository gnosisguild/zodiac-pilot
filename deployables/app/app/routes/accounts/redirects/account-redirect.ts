import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getAccount, getDefaultWorkspace } from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import type { Route } from './+types/account-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
      params: { accountId },
    }) => {
      const workspace = await getDefaultWorkspace(dbClient(), tenant.id)

      return redirect(
        href('/workspace/:workspaceId/accounts/:accountId', {
          workspaceId: workspace.id,
          accountId,
        }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { accountId } }) {
        invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

        const account = await getAccount(dbClient(), accountId)

        return account.tenantId === tenant.id
      },
    },
  )
