import type { DBClient } from '../../dbClient'

export const getTenants = (db: DBClient) => db.query.tenant.findMany()
