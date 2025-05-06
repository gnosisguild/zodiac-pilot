import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getAccount = async (db: DBClient, accountId: UUID) => {
  const account = await db.query.account.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, accountId)
    },
  })

  invariant(account != null, `Could not find account with id "${accountId}"`)

  return account
}
