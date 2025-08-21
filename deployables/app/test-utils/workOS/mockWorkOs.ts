import { getOrganization, getOrganizationsForUser } from '@/workOS/server'
import { Organization } from '@workos-inc/node'
import { Tenant, User } from '@zodiac/db/schema'
import { getAdminOrganizationId } from '@zodiac/env'
import { vi } from 'vitest'
import { createMockWorkOsOrganization } from './createMockWorkOsOrganization'
import { createMockWorkOsUser } from './createMockWorkOsUser'

const mockGetOrganizationsForUser = vi.mocked(getOrganizationsForUser)
const mockGetOrganization = vi.mocked(getOrganization)
const mockGetAdminOrgId = vi.mocked(getAdminOrganizationId)

type MockWorkOsOptions = {
  tenant?: Tenant | null
  user?: User | null
  workOsOrganization?: Partial<Organization> | null
  isSystemAdmin?: boolean
}

export const mockWorkOs = ({
  tenant,
  user,
  workOsOrganization,
  isSystemAdmin = false,
}: MockWorkOsOptions) => {
  if (user == null || tenant == null) {
    return null
  }

  const mockOrganization = createMockWorkOsOrganization({
    id: tenant.externalId ?? undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.createdAt.toISOString(),
    externalId: tenant.id,

    ...workOsOrganization,
  })

  if (isSystemAdmin) {
    mockGetAdminOrgId.mockReturnValue(mockOrganization.id)
  }

  mockGetOrganizationsForUser.mockResolvedValue([mockOrganization])
  mockGetOrganization.mockResolvedValue(mockOrganization)

  const [firstName, ...lastNames] = user.fullName.split(' ')

  return createMockWorkOsUser({
    id: user.externalId ?? undefined,
    createdAt: user.createdAt.toISOString(),
    externalId: user.id,
    firstName,
    lastName: lastNames.join(' '),
    updatedAt: user.createdAt.toISOString(),
  })
}
