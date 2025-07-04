import { authorizedLoader } from '@/auth-server'
import { dbClient, getDefaultWorkspace } from '@zodiac/db'
import { href, redirect } from 'react-router'
import type { Route } from './+types/load-default-workspace'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(href('/welcome'))
      }

      const defaultWorkspace = await getDefaultWorkspace(dbClient(), tenant.id)

      return redirect(
        href('/:workspaceId', { workspaceId: defaultWorkspace.id }),
      )
    },
  )
