import type { DBClient } from '../../dbClient'

export const findUserByExternalId = (db: DBClient, externalId: string) =>
  db.query.user.findFirst({
    where(fields, { eq }) {
      return eq(fields.externalId, externalId)
    },
  })
