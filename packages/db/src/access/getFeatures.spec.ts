import { describe, expect, it } from 'vitest'
import { dbClient } from '../dbClient'
import { activateFeature } from './activateFeature'
import { createFeature } from './createFeature'
import { createTenant } from './createTenant'
import { getFeatures } from './getFeatures'

describe('getFeatures', () => {
  it('returns features for a tenant', async () => {
    const db = dbClient()

    const tenant = await createTenant(db, { name: 'test' })
    const feature = await createFeature(db, 'test-feature')

    await activateFeature(db, { tenantId: tenant.id, featureId: feature.id })

    await expect(getFeatures(db, tenant.id)).resolves.toEqual([feature])
  })

  it('does not include features that are not active for a tenant', async () => {
    const db = dbClient()

    const tenant = await createTenant(db, { name: 'test' })
    await createFeature(db, 'test-feature')

    await expect(getFeatures(db, tenant.id)).resolves.toEqual([])
  })
})
