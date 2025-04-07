import { invariant } from '@epic-web/invariant'
import type { DBClient } from '../dbClient'

export const getAccount = async (db: DBClient, accountId: string) => {
  const account = await db.query.account.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, accountId)
    },
  })

  invariant(account != null, `Could not find account with id "${accountId}"`)

  return account
}
