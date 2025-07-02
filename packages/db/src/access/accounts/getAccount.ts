import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type GetAccountOptions = { deleted?: boolean }

export const getAccount = async (
  db: DBClient,
  accountId: UUID,
  { deleted = false }: GetAccountOptions = {},
) => {
  const account = await db.query.account.findFirst({
    where(fields, { eq, and }) {
      return and(eq(fields.id, accountId), eq(fields.deleted, deleted))
    },
  })

  invariant(account != null, `Could not find account with id "${accountId}"`)

  return account
}
