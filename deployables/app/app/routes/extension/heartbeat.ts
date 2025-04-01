import { authkitLoader } from '@workos-inc/authkit-react-router'
import type { Route } from './+types/heartbeat'

export const loader = (args: Route.LoaderArgs) => authkitLoader(args)
