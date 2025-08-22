import { post } from '@/test-utils'
import { dbClient, getRoleDeployment, getRoleDeploymentStep } from '@zodiac/db'
import {
  accountFactory,
  dbIt,
  roleDeploymentFactory,
  roleDeploymentStepFactory,
  roleFactory,
  routeFactory,
  signedTransactionFactory,
  tenantFactory,
  transactionProposalFactory,
  userFactory,
  walletFactory,
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

    const wallet = await walletFactory.create(user)
    const account = await accountFactory.create(tenant, user)

    const route = await routeFactory.create(account, wallet)

    const role = await roleFactory.create(tenant, user)
    const deployment = await roleDeploymentFactory.create(user, role)

    const transaction = await signedTransactionFactory.create(
      tenant,
      user,
      route,
    )
    const proposal = await transactionProposalFactory.create(
      tenant,
      user,
      account,
      {
        signedTransactionId: transaction.id,
      },
    )

    const step = await roleDeploymentStepFactory.create(user, deployment, {
      proposedTransactionId: proposal.id,
    })

    const transactionHash = randomHex(18)

    await post(
      href(
        '/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId/step/:deploymentStepId/sign-callback',
        {
          workspaceId: tenant.defaultWorkspaceId,
          deploymentId: deployment.id,
          deploymentStepId: step.id,
          roleId: role.id,
        },
      ),
      formData({ proposalId: proposal.id, transactionHash }),
    )

    await expect(
      getRoleDeploymentStep(dbClient(), step.id),
    ).resolves.toHaveProperty('transactionHash', transactionHash)
  })

  dbIt('records who completed the step when', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    const wallet = await walletFactory.create(user)
    const account = await accountFactory.create(tenant, user)
    const route = await routeFactory.create(account, wallet)

    const role = await roleFactory.create(tenant, user)
    const deployment = await roleDeploymentFactory.create(user, role)

    const transaction = await signedTransactionFactory.create(
      tenant,
      user,
      route,
    )
    const proposal = await transactionProposalFactory.create(
      tenant,
      user,
      account,
      { signedTransactionId: transaction.id },
    )

    const step = await roleDeploymentStepFactory.create(user, deployment, {
      proposedTransactionId: proposal.id,
    })

    const transactionHash = randomHex(18)

    await post(
      href(
        '/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId/step/:deploymentStepId/sign-callback',
        {
          workspaceId: tenant.defaultWorkspaceId,
          deploymentId: deployment.id,
          deploymentStepId: step.id,
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

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const route = await routeFactory.create(account, wallet)

      const role = await roleFactory.create(tenant, user)
      const deployment = await roleDeploymentFactory.create(user, role)

      const transaction = await signedTransactionFactory.create(
        tenant,
        user,
        route,
      )
      const proposal = await transactionProposalFactory.create(
        tenant,
        user,
        account,
        { signedTransactionId: transaction.id },
      )

      const step = await roleDeploymentStepFactory.create(user, deployment, {
        proposedTransactionId: proposal.id,
      })

      const transactionHash = randomHex(18)

      await post(
        href(
          '/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId/step/:deploymentStepId/sign-callback',
          {
            workspaceId: tenant.defaultWorkspaceId,
            deploymentId: deployment.id,
            deploymentStepId: step.id,
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

  dbIt('redirects to the deployment page', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    const wallet = await walletFactory.create(user)
    const account = await accountFactory.create(tenant, user)
    const route = await routeFactory.create(account, wallet)

    const role = await roleFactory.create(tenant, user)
    const deployment = await roleDeploymentFactory.create(user, role)

    const transaction = await signedTransactionFactory.create(
      tenant,
      user,
      route,
    )
    const proposal = await transactionProposalFactory.create(
      tenant,
      user,
      account,
      { signedTransactionId: transaction.id },
    )

    const step = await roleDeploymentStepFactory.create(user, deployment, {
      proposedTransactionId: proposal.id,
    })

    const transactionHash = randomHex(18)

    const response = await post(
      href(
        '/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId/step/:deploymentStepId/sign-callback',
        {
          workspaceId: tenant.defaultWorkspaceId,
          deploymentId: deployment.id,
          deploymentStepId: step.id,
          roleId: role.id,
        },
      ),
      formData({ proposalId: proposal.id, transactionHash }),
      { tenant, user },
    )

    await expect(response.json()).resolves.toEqual({
      redirectTo: `/workspace/${tenant.defaultWorkspaceId}/roles/${role.id}/deployment/${deployment.id}`,
    })
  })
})
