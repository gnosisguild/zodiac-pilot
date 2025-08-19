import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dbClient, getRoleDeployment, getRoleDeployments } from '@zodiac/db'
import {
  dbIt,
  roleDeploymentFactory,
  roleFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { expectRouteToBe, waitForPendingActions } from '@zodiac/test-utils'
import { href } from 'react-router'
import { beforeEach, describe, expect, vi } from 'vitest'

describe('Managed roles', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date())
  })

  describe('Deploy', () => {
    dbIt('creates a new deployment', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const role = await roleFactory.create(tenant, user)

      await render(
        href('/workspace/:workspaceId/roles', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Deploy' }),
      )

      await waitForPendingActions()

      const [deployment] = await getRoleDeployments(dbClient(), role.id)

      await expectRouteToBe(
        href('/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
          deploymentId: deployment.id,
        }),
      )
    })

    describe('Outstanding deployment', () => {
      dbIt('gives the user the option to open pending deployment', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const role = await roleFactory.create(tenant, user)
        const deployment = await roleDeploymentFactory.create(user, role)

        await render(
          href('/workspace/:workspaceId/roles', {
            workspaceId: tenant.defaultWorkspaceId,
          }),
          { tenant, user },
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Deploy' }),
        )
        await userEvent.click(
          await screen.findByRole('link', { name: 'Open deployment' }),
        )

        await expectRouteToBe(
          href(
            '/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId',
            {
              deploymentId: deployment.id,
              roleId: role.id,
              workspaceId: tenant.defaultWorkspaceId,
            },
          ),
        )
      })

      dbIt(
        'gives the user the option to cancel the current deployment',
        async () => {
          const user = await userFactory.create()
          const tenant = await tenantFactory.create(user)

          const role = await roleFactory.create(tenant, user)
          const deployment = await roleDeploymentFactory.create(user, role)

          await render(
            href('/workspace/:workspaceId/roles', {
              workspaceId: tenant.defaultWorkspaceId,
            }),
            { tenant, user },
          )

          await userEvent.click(
            await screen.findByRole('button', { name: 'Deploy' }),
          )
          await userEvent.click(
            await screen.findByRole('button', { name: 'Cancel deployment' }),
          )

          await waitForPendingActions()

          await expect(
            getRoleDeployment(dbClient(), deployment.id),
          ).resolves.toMatchObject({
            cancelledAt: new Date(),
            cancelledById: user.id,
          })
        },
      )
    })
  })
})
