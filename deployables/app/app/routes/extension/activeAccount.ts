import { authorizedAction, authorizedLoader } from '@/auth'
import {
  activateAccount,
  dbClient,
  findActiveAccount,
  getAccount,
  getActiveAccount,
} from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import type { Route } from './+types/active-account'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { user, tenant },
      },
    }) => {
      if (user == null) {
        return null
      }

      return await findActiveAccount(dbClient(), tenant, user)
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      context: {
        auth: { user, tenant },
      },
    }) => {
      if (user == null) {
        return null
      }

      const data = await request.formData()

      await activateAccount(
        dbClient(),
        tenant,
        user,
        getString(data, 'accountId'),
      )

      return await getActiveAccount(dbClient(), tenant, user)
    },
    {
      async hasAccess({ tenant, request }) {
        if (tenant == null) {
          return true
        }

        const data = await request.formData()
        const account = await getAccount(
          dbClient(),
          getString(data, 'accountId'),
        )

        return account.tenantId === tenant.id
      },
    },
  )
