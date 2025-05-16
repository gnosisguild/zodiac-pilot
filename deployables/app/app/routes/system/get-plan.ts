import { authorizedAction } from '@/auth-server'
import { getSystemAuthToken } from '@zodiac/env'
import type { Route } from './+types/get-plan'

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    () => {
      return { currentPlan: 'none' }
    },
    {
      hasAccess({ request }) {
        const authHeader = request.headers.get('Authorization')

        return authHeader === `Bearer ${getSystemAuthToken()}`
      },
    },
  )
