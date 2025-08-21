import { post } from '@/test-utils'
import { dbClient, getRoleDeploymentStep } from '@zodiac/db'
import {
  accountFactory,
  dbIt,
  roleDeploymentFactory,
  roleDeploymentStepFactory,
  roleFactory,
  tenantFactory,
  transactionProposalFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { formData } from '@zodiac/form-data'
import { randomHex } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect } from 'vitest'

describe('Sign callback', () => {
  dbIt('stores the transaction hash on the deployment step', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    const account = await accountFactory.create(tenant, user)

    const role = await roleFactory.create(tenant, user)
    const deployment = await roleDeploymentFactory.create(user, role)

    const proposal = await transactionProposalFactory.create(
      tenant,
      user,
      account,
    )

    const step = await roleDeploymentStepFactory.create(user, deployment, {
      proposedTransactionId: proposal.id,
    })

    const transactionHash = randomHex(18)

    await post(
      href(
        '/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId/sign-callback',
        {
          workspaceId: tenant.defaultWorkspaceId,
          deploymentId: deployment.id,
          roleId: role.id,
        },
      ),
      formData({ proposalId: proposal.id, transactionHash }),
      { tenant, user },
    )

    await expect(
      getRoleDeploymentStep(dbClient(), step.id),
    ).resolves.toHaveProperty('transactionHash', transactionHash)
  })
})
