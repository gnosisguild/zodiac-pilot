import {
  dbIt,
  roleDeploymentFactory,
  roleFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { beforeEach, describe, expect, vi } from 'vitest'
import { dbClient } from '../../dbClient'
import { assertActiveRoleDeployment } from './assertActiveRoleDeployment'
import { cancelRoleDeployment } from './cancelRoleDeployment'
import { completeRoleDeploymentIfNeeded } from './completeRoleDeploymentIfNeeded'
import { getRoleDeployment } from './getRoleDeployment'

describe('completeDeploymentIfNeeded', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date())
  })

  dbIt('sets the deployment to completed', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    const role = await roleFactory.create(tenant, user)
    const deployment = await roleDeploymentFactory.create(user, role)

    await completeRoleDeploymentIfNeeded(dbClient(), deployment.id)

    await expect(
      getRoleDeployment(dbClient(), deployment.id),
    ).resolves.toHaveProperty('completedAt', new Date())
  })

  dbIt('does not complete the deployment if it was cancelled', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    const role = await roleFactory.create(tenant, user)
    const deployment = await roleDeploymentFactory.create(user, role)

    assertActiveRoleDeployment(deployment)

    await cancelRoleDeployment(dbClient(), user, deployment)

    await completeRoleDeploymentIfNeeded(dbClient(), deployment.id)

    await expect(
      getRoleDeployment(dbClient(), deployment.id),
    ).resolves.toHaveProperty('completedAt', null)
  })
})
