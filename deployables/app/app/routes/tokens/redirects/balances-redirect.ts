import { authorizedLoader } from '@/auth-server'
import { dbClient, getDefaultWorkspace } from '@zodiac/db'
import { href, redirect } from 'react-router'
import type { Route } from './+types/balances-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(href('/offline/tokens/balances'))
      }

      const defaultWorkspace = await getDefaultWorkspace(dbClient(), tenant)

      return redirect(
        href('/workspace/:workspaceId/tokens/balances', {
          workspaceId: defaultWorkspace.id,
        }),
      )
    },
  )
