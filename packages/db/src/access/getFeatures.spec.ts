import { describe, expect, it } from 'vitest'
import { featureFactory, tenantFactory } from '../../test-utils'
import { dbClient } from '../dbClient'
import { activateFeature } from './activateFeature'
import { getFeatures } from './getFeatures'

describe('getFeatures', () => {
  it('returns features for a tenant', async () => {
    const tenant = await tenantFactory.create()
    const feature = await featureFactory.create()

    await activateFeature(dbClient(), {
      tenantId: tenant.id,
      featureId: feature.id,
    })

    await expect(getFeatures(dbClient(), tenant.id)).resolves.toEqual([feature])
  })

  it('does not include features that are not active for a tenant', async () => {
    const tenant = await tenantFactory.create()
    await featureFactory.create()

    await expect(getFeatures(dbClient(), tenant.id)).resolves.toEqual([])
  })
})
