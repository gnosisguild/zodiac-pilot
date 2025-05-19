import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getFeature = async (db: DBClient, featureId: UUID) => {
  const feature = await db.query.feature.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, featureId)
    },
  })

  invariant(feature != null, `Could not find feature with id "${featureId}"`)

  return feature
}
