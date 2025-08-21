import { post } from '@/test-utils'
import { dbClient, getRoleDeployment, getRoleDeploymentStep } from '@zodiac/db'
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
import { beforeEach, describe, expect, vi } from 'vitest'

describe('Sign callback', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date())
  })

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

  dbIt('records who completed the step when', async () => {
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
    ).resolves.toMatchObject({
      completedAt: new Date(),
      completedById: user.id,
    })
  })

  dbIt(
    'completes the deployment if all steps have been completed',
    async () => {
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

      await roleDeploymentStepFactory.create(user, deployment, {
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
        getRoleDeployment(dbClient(), deployment.id),
      ).resolves.toMatchObject({
        completedAt: new Date(),
      })
    },
  )
})
