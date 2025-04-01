import { authkitLoader } from '@workos-inc/authkit-react-router'
import { redirect } from 'react-router'
import type { Route } from './+types/callback'

export const loader = (args: Route.LoaderArgs) =>
  authkitLoader(args, () => {
    return redirect(
      `https://elphcpohliglhdcegnjnalikdnljdjji.chromiumapp.org/callback`,
    )
  })
