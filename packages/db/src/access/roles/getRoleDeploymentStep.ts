import { invariant } from '@epic-web/invariant'
import { jsonParse, metaTransactionRequestSchema } from '@zodiac/schema'
import { UUID } from 'crypto'
import { Account, AccountBuilderCall } from 'ser-kit'
import { DBClient } from '../../dbClient'

export const getRoleDeploymentStep = async (
  db: DBClient,
  roleDeploymentStepId: UUID,
) => {
  const step = await db.query.roleDeploymentStep.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, roleDeploymentStepId)
    },
  })

  invariant(
    step != null,
    `Could not find role deployment step with id "${roleDeploymentStepId}"`,
  )

  const { account, calls, transactionBundle, ...rest } = step

  return {
    account: jsonParse<Account>(account),
    calls: jsonParse<AccountBuilderCall[]>(calls),
    transactionBundle: metaTransactionRequestSchema
      .array()
      .parse(jsonParse(transactionBundle)),

    ...rest,
  }
}
