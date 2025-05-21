import type { Organization } from '@workos-inc/node'
import { randomUUID } from 'crypto'

export const createMockWorkOsOrganization = (
  organization: Partial<Organization> = {},
): Organization => ({
  allowProfilesOutsideOrganization: false,
  createdAt: new Date().toISOString(),
  domains: [],
  id: randomUUID(),
  metadata: {},
  name: 'Test Org',
  object: 'organization',
  updatedAt: new Date().toISOString(),
  externalId: null,

  ...organization,
})
