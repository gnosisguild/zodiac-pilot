import { authorizedAction } from '@/auth'
import { dbClient, removeActiveAccount } from '@zodiac/db'
import type { Route } from './+types/removeActiveAccount'

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      context: {
        auth: { user, tenant },
      },
    }) => {
      if (user == null) {
        return null
      }

      await removeActiveAccount(dbClient(), tenant, user)

      return null
    },
  )
