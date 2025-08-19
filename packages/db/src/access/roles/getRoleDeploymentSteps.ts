import { jsonParse, metaTransactionRequestSchema } from '@zodiac/schema'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const getRoleDeploymentSteps = async (
  db: DBClient,
  deploymentId: UUID,
) => {
  const steps = await db.query.roleDeploymentStep.findMany({
    where(fields, { eq }) {
      return eq(fields.roleDeploymentId, deploymentId)
    },
    orderBy(fields, { asc }) {
      return asc(fields.index)
    },
  })

  return steps.map(({ account, calls, transactionBundle, ...step }) => {
    return {
      ...step,
      account: jsonParse(account),
      calls: jsonParse(calls),
      transactionBundle: metaTransactionRequestSchema
        .array()
        .parse(jsonParse(transactionBundle)),
    }
  })
}
