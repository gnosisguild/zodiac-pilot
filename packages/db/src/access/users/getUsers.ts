import type { DBClient } from '../../dbClient'

export const getUsers = (db: DBClient) =>
  db.query.user.findMany({
    orderBy(fields, { asc }) {
      return asc(fields.fullName)
    },
  })
