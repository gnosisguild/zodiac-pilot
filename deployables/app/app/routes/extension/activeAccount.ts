import { authorizedAction, authorizedLoader } from '@/auth-server'
import {
  activateAccount,
  dbClient,
  findActiveAccount,
  getAccount,
  getActiveAccount,
  removeActiveAccount,
} from '@zodiac/db'
import { getString } from '@zodiac/form-data'
import { isUUID, jsonStringify, safeJson } from '@zodiac/schema'
import type { Route } from './+types/activeAccount'

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

      const account = await findActiveAccount(dbClient(), tenant, user)

      if (account == null) {
        return null
      }

      return safeJson(account)
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
      const accountId = getString(data, 'accountId')

      if (isUUID(accountId)) {
        await activateAccount(dbClient(), tenant, user, accountId)

        const account = await getActiveAccount(dbClient(), tenant, user)

        return jsonStringify(account)
      }

      await removeActiveAccount(dbClient(), tenant, user)

      return null
    },
    {
      async hasAccess({ tenant, request }) {
        if (tenant == null) {
          return true
        }

        const data = await request.formData()
        const accountId = getString(data, 'accountId')

        if (!isUUID(accountId)) {
          return true
        }

        const account = await getAccount(dbClient(), accountId)

        return account.tenantId === tenant.id
      },
    },
  )
