import { authorizedLoader } from '@/auth'
import type { Route } from './+types/account'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    ({
      context: {
        auth: { user },
      },
    }) => {
      if (user == null) {
        return null
      }
    },
    {
      // TODO: hasAccess without enforced sign-in
      hasAccess({ user }) {
        return true
      },
    },
  )
