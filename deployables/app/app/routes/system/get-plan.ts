import { authorizedLoader } from '@/auth-server'
import { getSystemAuthToken } from '@zodiac/env'
import type { Route } from './+types/get-plan'

export const action = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    () => {
      return { currentPlan: 'open' }
    },
    {
      hasAccess({ request }) {
        const authHeader = request.headers.get('Authorization')

        return authHeader === `Bearer ${getSystemAuthToken()}`
      },
    },
  )
