import {
  createMockWorkOsOrganization,
  createMockWorkOsUser,
} from '@/test-utils'
import { getWorkOS } from '@workos-inc/authkit-react-router'
import { AutoPaginatable } from '@workos-inc/node'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOrganizationsForUser } from './getOrganizationsForUser'

vi.mock('@workos-inc/authkit-react-router', async (importOriginal) => {
  const module =
    await importOriginal<typeof import('@workos-inc/authkit-react-router')>()

  const listOrganizationMemberships = vi.fn()
  const createOrganizationMembership = vi.fn()

  const createOrganization = vi.fn()

  return {
    ...module,

    getWorkOS: () => ({
      userManagement: {
        listOrganizationMemberships,
        createOrganizationMembership,
      },

      organizations: {
        createOrganization,
      },
    }),
  }
})

const mockListOrganizationMemberShips = vi.mocked(
  getWorkOS().userManagement.listOrganizationMemberships,
)
const mockCreateOrganization = vi.mocked(
  getWorkOS().organizations.createOrganization,
)

describe('Get organizations for user', () => {
  const createListMembershipsResult = (): Awaited<
    ReturnType<typeof mockListOrganizationMemberShips>
  > => {
    return new AutoPaginatable(
      { listMetadata: {}, data: [], object: 'list' },
      async () => ({ data: [], listMetadata: {}, object: 'list' }),
      {},
    )
  }

  describe('Upsert', () => {
    beforeEach(() => {
      mockCreateOrganization.mockResolvedValue(createMockWorkOsOrganization())
    })

    it('creates an organization if the user has no active memberships', async () => {
      mockListOrganizationMemberShips.mockResolvedValue(
        createListMembershipsResult(),
      )

      await getOrganizationsForUser(createMockWorkOsUser({ firstName: 'Phil' }))

      expect(getWorkOS().organizations.createOrganization).toHaveBeenCalledWith(
        { name: "Phil's Zodiac OS space" },
      )
    })

    it('enrolls the user in the newly created organization', async () => {
      mockListOrganizationMemberShips.mockResolvedValue(
        createListMembershipsResult(),
      )
      mockCreateOrganization.mockResolvedValue(
        createMockWorkOsOrganization({ id: 'test-org' }),
      )

      await getOrganizationsForUser(
        createMockWorkOsUser({ firstName: 'Phil', id: 'test-user' }),
      )

      expect(
        getWorkOS().userManagement.createOrganizationMembership,
      ).toHaveBeenCalledWith({
        organizationId: 'test-org',
        userId: 'test-user',
        roleSlug: 'admin',
      })
    })

    it('fetches the new organization', async () => {
      mockListOrganizationMemberShips.mockResolvedValue(
        createListMembershipsResult(),
      )

      const organization = createMockWorkOsOrganization()

      mockCreateOrganization.mockResolvedValue(organization)

      await expect(
        getOrganizationsForUser(createMockWorkOsUser()),
      ).resolves.toEqual([organization])
    })
  })
})
