import { authorizedLoader } from '@/auth-server'
import { dbClient, getDefaultWorkspace } from '@zodiac/db'
import { href, redirect } from 'react-router'
import type { Route } from './+types/list-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(href('/offline/accounts'))
      }

      const defaultWorkspace = await getDefaultWorkspace(dbClient(), tenant)

      return redirect(
        href('/workspace/:workspaceId/accounts', {
          workspaceId: defaultWorkspace.id,
        }),
      )
    },
  )
