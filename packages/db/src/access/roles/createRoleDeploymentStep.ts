import { getChainId } from '@zodiac/chains'
import { RoleDeployment, RoleDeploymentStepTable } from '@zodiac/db/schema'
import { jsonStringify, MetaTransactionRequest } from '@zodiac/schema'
import { Account, AccountBuilderCall } from 'ser-kit'
import { DBClient } from '../../dbClient'

type CreateRoleDeploymentStepOptions = {
  account: Account
  calls: AccountBuilderCall[]
  transactionBundle: MetaTransactionRequest[]
}

export const createRoleDeploymentStep = async (
  db: DBClient,
  roleDeployment: RoleDeployment,
  { account, calls, transactionBundle }: CreateRoleDeploymentStepOptions,
) => {
  const previousStep = await db.query.roleDeploymentStep.findFirst({
    where(fields, { eq }) {
      return eq(fields.roleDeploymentId, roleDeployment.id)
    },
  })

  return db.insert(RoleDeploymentStepTable).values({
    account: JSON.parse(jsonStringify(account)),
    calls: JSON.parse(jsonStringify(calls)),
    chainId: getChainId(account.prefixedAddress),
    index: previousStep == null ? 0 : previousStep.index + 1,
    roleDeploymentId: roleDeployment.id,
    tenantId: roleDeployment.tenantId,
    transactionBundle: JSON.parse(jsonStringify(transactionBundle)),
    workspaceId: roleDeployment.workspaceId,
  })
}
