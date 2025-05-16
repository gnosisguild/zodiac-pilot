import { type VerifiedOrganization } from '@/workOS/server'
import type { Organization } from '@workos-inc/node'
import { isUUID } from '@zodiac/schema'
import { randomUUID } from 'crypto'

export const createMockWorkOsOrganization = ({
  externalId,
  ...organization
}: Partial<Organization> = {}): VerifiedOrganization => ({
  allowProfilesOutsideOrganization: false,
  createdAt: new Date().toISOString(),
  domains: [],
  id: randomUUID(),
  metadata: {},
  name: 'Test Org',
  object: 'organization',
  updatedAt: new Date().toISOString(),
  externalId:
    externalId == null || !isUUID(externalId) ? randomUUID() : externalId,

  ...organization,
})
