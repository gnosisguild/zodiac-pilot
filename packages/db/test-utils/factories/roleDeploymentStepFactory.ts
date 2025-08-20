import { Chain } from '@zodiac/chains'
import {
  RoleDeployment,
  RoleDeploymentStep,
  RoleDeploymentStepCreateInput,
  RoleDeploymentStepTable,
  User,
} from '@zodiac/db/schema'
import { createMockSafeAccount } from '@zodiac/modules/test-utils'
import { safeJson } from '@zodiac/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const roleDeploymentStepFactory = createFactory<
  RoleDeploymentStepCreateInput,
  RoleDeploymentStep,
  [createdBy: User, deployment: RoleDeployment]
>({
  build(
    createdBy,
    deployment,
    {
      transactionBundle = [],
      calls = [],
      account = createMockSafeAccount(),
      ...data
    } = {},
  ) {
    return {
      createdById: createdBy.id,
      roleId: deployment.roleId,
      tenantId: deployment.tenantId,
      workspaceId: deployment.workspaceId,
      account: safeJson(account),
      calls: safeJson(calls),
      chainId: Chain.ETH,
      index: 0,
      roleDeploymentId: deployment.id,
      transactionBundle: safeJson(transactionBundle),

      ...data,
    }
  },
  async create(db, data) {
    const [deploymentStep] = await db
      .insert(RoleDeploymentStepTable)
      .values(data)
      .returning()

    return deploymentStep
  },
  createWithoutDb(data) {
    return {
      id: randomUUID(),
      createdAt: new Date(),

      cancelledAt: null,
      cancelledById: null,
      completedAt: null,
      completedById: null,
      proposedTransactionId: null,
      signedTransactionId: null,
      transactionHash: null,
      updatedAt: null,
      targetAccount: null,

      ...data,
    }
  },
})
