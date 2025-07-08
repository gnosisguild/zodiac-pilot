import { authorizedLoader } from '@/auth-server'
import { dbClient, getDefaultWorkspace } from '@zodiac/db'
import { href, redirect } from 'react-router'
import type { Route } from './+types/create-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(href('/offline/accounts/create'))
      }

      const defaultWorkspace = await getDefaultWorkspace(dbClient(), tenant)

      return redirect(
        href('/workspace/:workspaceId/accounts/create/:prefixedAddress?', {
          workspaceId: defaultWorkspace.id,
        }),
      )
    },
  )
