import { render } from '@/test-utils'
import { dryRun } from '@/utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain, CHAIN_NAME } from '@zodiac/chains'
import { CompanionAppMessageType } from '@zodiac/messages'
import {
  encodeRoleKey,
  fetchZodiacModules,
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
  removeAvatar,
  SupportedZodiacModuleType,
  updateAvatar,
  updateRoleId,
} from '@zodiac/modules'
import { encode } from '@zodiac/schema'
import {
  createMockEndWaypoint,
  createMockExecutionRoute,
  createMockRoleWaypoint,
  createMockWaypoints,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { prefixAddress, queryAvatars, type ChainId } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    queryAvatars: vi.fn(),
  }
})

const mockQueryAvatars = vi.mocked(queryAvatars)

vi.mock('@zodiac/modules', async (importOriginal) => {
  const module = await importOriginal<typeof import('@zodiac/modules')>()

  return {
    ...module,

    fetchZodiacModules: vi.fn(),
    queryRolesV1MultiSend: vi.fn(),
    queryRolesV2MultiSend: vi.fn(),
  }
})

const mockFetchZodiacModules = vi.mocked(fetchZodiacModules)
const mockQueryRolesV1MultiSend = vi.mocked(queryRolesV1MultiSend)
const mockQueryRolesV2MultiSend = vi.mocked(queryRolesV2MultiSend)

const mockPostMessage = vi.spyOn(window, 'postMessage')

vi.mock('@/utils', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/utils')>()

  return {
    ...module,
    dryRun: vi.fn(),
  }
})

const mockDryRun = vi.mocked(dryRun)

describe('Edit route', () => {
  beforeEach(() => {
    mockFetchZodiacModules.mockResolvedValue([])
  })

  describe('Label', () => {
    it('shows the name of a route', async () => {
      const route = createMockExecutionRoute({ label: 'Test route' })

      await render(`/edit-route/${encode(route)}`)

      expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue(
        'Test route',
      )
    })

    it('is possible to change the label of a route', async () => {
      const route = createMockExecutionRoute()

      await render(`/edit-route/${encode(route)}`)

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Label' }),
        'New route label',
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Close' }),
      )

      expect(mockPostMessage).toHaveBeenCalledWith(
        {
          type: CompanionAppMessageType.SAVE_ROUTE,
          data: expect.objectContaining({ label: 'New route label' }),
        },
        expect.anything(),
      )
    })
  })

  describe('Chain', () => {
    it.each(Object.entries(CHAIN_NAME))(
      'shows chainId "%s" as "%s"',
      async (chainId, name) => {
        const route = createMockExecutionRoute({
          avatar: randomPrefixedAddress({
            chainId: parseInt(chainId) as ChainId,
          }),
        })

        await render(`/edit-route/${encode(route)}`)

        expect(screen.getByText(name)).toBeInTheDocument()
      },
    )
  })

  describe('Pilot Account', () => {
    it('offers a button to connect', async () => {
      const route = createMockExecutionRoute()

      await render(`/edit-route/${encode(route)}`)

      expect(
        await screen.findByRole('button', { name: 'Connect wallet' }),
      ).toBeInTheDocument()
    })
  })

  describe('Avatar', () => {
    it('shows the avatar of a route', async () => {
      const avatar = randomAddress()

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ address: avatar }),
      })

      await render(`/edit-route/${encode(route)}`)

      expect(screen.getByText(avatar)).toBeInTheDocument()
    })

    it('offers safes that are owned by the user', async () => {
      const safe = randomAddress()

      mockQueryAvatars.mockResolvedValue([prefixAddress(Chain.ETH, safe)])

      const route = createMockExecutionRoute({
        initiator: randomPrefixedAddress(),
      })

      await render(`/edit-route/${encode(route)}`)

      await userEvent.click(
        await screen.findByRole('button', { name: 'View all available Safes' }),
      )

      expect(screen.getByRole('option', { name: safe })).toBeInTheDocument()
    })

    describe('Edit', () => {
      it('is possible to select a safe from the list', async () => {
        const safe = randomAddress()

        mockQueryAvatars.mockResolvedValue([prefixAddress(Chain.ETH, safe)])

        const route = createMockExecutionRoute({
          initiator: randomPrefixedAddress(),
        })

        await render(`/edit-route/${encode(route)}`)

        await userEvent.click(
          await screen.findByRole('button', {
            name: 'View all available Safes',
          }),
        )

        await userEvent.click(screen.getByRole('option', { name: safe }))

        await userEvent.click(
          screen.getByRole('button', { name: 'Save & Close' }),
        )

        expect(mockPostMessage).toHaveBeenCalledWith(
          {
            type: CompanionAppMessageType.SAVE_ROUTE,
            data: updateAvatar(route, { safe }),
          },
          expect.anything(),
        )
      })

      it('is possible to type in an address', async () => {
        const safe = randomAddress()

        mockQueryAvatars.mockResolvedValue([])

        const route = createMockExecutionRoute()

        await render(`/edit-route/${encode(route)}`)

        await userEvent.type(
          screen.getByRole('textbox', { name: 'Piloted Safe' }),
          safe,
        )
        await userEvent.click(
          screen.getByRole('button', { name: 'Save & Close' }),
        )

        expect(mockPostMessage).toHaveBeenCalledWith(
          {
            type: CompanionAppMessageType.SAVE_ROUTE,
            data: updateAvatar(route, { safe }),
          },
          expect.anything(),
        )
      })

      it('is possible to remove the avatar', async () => {
        const safe = randomAddress()

        const route = createMockExecutionRoute({
          avatar: prefixAddress(Chain.ETH, safe),
          waypoints: createMockWaypoints({
            end: createMockEndWaypoint({ account: { address: safe } }),
          }),
        })

        await render(`/edit-route/${encode(route)}`)

        await userEvent.click(
          screen.getByRole('button', { name: 'Clear piloted Safe' }),
        )
        await userEvent.click(
          screen.getByRole('button', { name: 'Save & Close' }),
        )

        expect(mockPostMessage).toHaveBeenCalledWith(
          {
            type: CompanionAppMessageType.SAVE_ROUTE,
            data: removeAvatar(route),
          },
          expect.anything(),
        )
      })
    })
  })

  describe('Role', () => {
    it('is possible to update the roles mod', async () => {
      const selectedMod = randomAddress()

      mockFetchZodiacModules.mockResolvedValue([
        {
          type: SupportedZodiacModuleType.ROLES_V1,
          moduleAddress: selectedMod,
        },
        {
          type: SupportedZodiacModuleType.ROLES_V2,
          moduleAddress: randomAddress(),
        },
      ])

      mockQueryRolesV2MultiSend.mockResolvedValue([])

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress(),
        waypoints: createMockWaypoints({
          waypoints: [
            createMockRoleWaypoint({ moduleAddress: selectedMod, version: 1 }),
          ],
          end: true,
        }),
      })

      await render(`/edit-route/${encode(route)}`)

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Zodiac Mod' }),
      )
      await userEvent.click(screen.getByRole('option', { name: 'Roles v2' }))

      await waitFor(async () => {
        expect(await screen.findByText('Roles v2')).toBeInTheDocument()
      })
    })

    it('reloads the modules when the chain changes', async () => {
      mockFetchZodiacModules.mockResolvedValue([])

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress(),
        waypoints: createMockWaypoints({ end: true }),
      })

      await render(`/edit-route/${encode(route)}`)

      await userEvent.click(screen.getByRole('combobox', { name: 'Chain' }))
      await userEvent.click(screen.getByRole('option', { name: 'Gnosis' }))

      await waitFor(() => {
        expect(mockFetchZodiacModules).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ chainId: Chain.GNO }),
        )
      })
    })

    describe('V1', () => {
      it('shows the when the v1 role mod is selected', async () => {
        const moduleAddress = randomAddress()

        mockFetchZodiacModules.mockResolvedValue([
          {
            type: SupportedZodiacModuleType.ROLES_V1,
            moduleAddress,
          },
        ])

        const route = createMockExecutionRoute({
          avatar: randomPrefixedAddress(),
          waypoints: createMockWaypoints({
            waypoints: [createMockRoleWaypoint({ moduleAddress, version: 1 })],
          }),
        })

        await render(`/edit-route/${encode(route)}`)

        await waitFor(async () => {
          expect(await screen.findByText('Roles v1')).toBeInTheDocument()
        })
      })

      it('is possible to select the v1 roles mod', async () => {
        mockFetchZodiacModules.mockResolvedValue([
          {
            type: SupportedZodiacModuleType.ROLES_V1,
            moduleAddress: randomAddress(),
          },
        ])

        mockQueryRolesV1MultiSend.mockResolvedValue([])

        const route = createMockExecutionRoute({
          avatar: randomPrefixedAddress(),
          waypoints: createMockWaypoints({ end: true }),
        })

        await render(`/edit-route/${encode(route)}`)

        await userEvent.click(
          await screen.findByRole('combobox', { name: 'Zodiac Mod' }),
        )
        await userEvent.click(screen.getByRole('option', { name: 'Roles v1' }))

        await waitFor(async () => {
          expect(await screen.findByText('Roles v1')).toBeInTheDocument()
        })
      })

      describe('Config', () => {
        it('shows the v1 role config when the v1 route mod is used', async () => {
          const moduleAddress = randomAddress()
          const roleId = randomAddress()

          mockFetchZodiacModules.mockResolvedValue([
            {
              type: SupportedZodiacModuleType.ROLES_V1,
              moduleAddress,
            },
          ])

          const route = createMockExecutionRoute({
            avatar: randomPrefixedAddress(),
            waypoints: createMockWaypoints({
              waypoints: [
                createMockRoleWaypoint({ moduleAddress, roleId, version: 1 }),
              ],
            }),
          })

          await render(`/edit-route/${encode(route)}`)

          expect(
            await screen.findByRole('textbox', { name: 'Role ID' }),
          ).toHaveValue(roleId)
        })

        it('is possible to update the role ID', async () => {
          const moduleAddress = randomAddress()

          mockFetchZodiacModules.mockResolvedValue([
            {
              type: SupportedZodiacModuleType.ROLES_V1,
              moduleAddress,
            },
          ])

          const route = createMockExecutionRoute({
            avatar: randomPrefixedAddress(),
            waypoints: createMockWaypoints({
              waypoints: [
                createMockRoleWaypoint({ moduleAddress, version: 1 }),
              ],
            }),
          })

          await render(`/edit-route/${encode(route)}`)

          const roleId = randomAddress()

          await waitFor(async () =>
            expect(
              await screen.findByRole('textbox', { name: 'Role ID' }),
            ).not.toBeDisabled(),
          )

          await userEvent.type(
            await screen.findByRole('textbox', { name: 'Role ID' }),
            roleId,
          )

          await userEvent.click(
            screen.getByRole('button', { name: 'Save & Close' }),
          )

          expect(mockPostMessage).toHaveBeenCalledWith(
            {
              type: CompanionAppMessageType.SAVE_ROUTE,
              data: updateRoleId(route, roleId),
            },
            expect.anything(),
          )
        })
      })
    })

    describe('V2', () => {
      it('shows when the v2 role mod is selected', async () => {
        const moduleAddress = randomAddress()

        mockFetchZodiacModules.mockResolvedValue([
          {
            type: SupportedZodiacModuleType.ROLES_V2,
            moduleAddress,
          },
        ])

        const route = createMockExecutionRoute({
          avatar: randomPrefixedAddress(),
          waypoints: createMockWaypoints({
            waypoints: [createMockRoleWaypoint({ moduleAddress, version: 2 })],
          }),
        })

        await render(`/edit-route/${encode(route)}`)

        await waitFor(async () => {
          expect(await screen.findByText('Roles v2')).toBeInTheDocument()
        })
      })

      it('is possible to select the v2 roles mod', async () => {
        mockFetchZodiacModules.mockResolvedValue([
          {
            type: SupportedZodiacModuleType.ROLES_V2,
            moduleAddress: randomAddress(),
          },
        ])

        mockQueryRolesV2MultiSend.mockResolvedValue([])

        const route = createMockExecutionRoute({
          avatar: randomPrefixedAddress(),
          waypoints: createMockWaypoints({ end: true }),
        })

        await render(`/edit-route/${encode(route)}`)

        await userEvent.click(
          await screen.findByRole('combobox', { name: 'Zodiac Mod' }),
        )
        await userEvent.click(screen.getByRole('option', { name: 'Roles v2' }))

        await waitFor(async () => {
          expect(await screen.findByText('Roles v2')).toBeInTheDocument()
        })
      })

      describe('Config', () => {
        it('shows the v2 role config when the v2 route mod is used', async () => {
          const moduleAddress = randomAddress()

          mockFetchZodiacModules.mockResolvedValue([
            {
              type: SupportedZodiacModuleType.ROLES_V2,
              moduleAddress,
            },
          ])

          const route = createMockExecutionRoute({
            avatar: randomPrefixedAddress(),
            waypoints: createMockWaypoints({
              waypoints: [
                createMockRoleWaypoint({
                  moduleAddress,
                  roleId: encodeRoleKey('TEST-KEY'),
                  version: 2,
                }),
              ],
            }),
          })

          await render(`/edit-route/${encode(route)}`)

          expect(
            await screen.findByRole('textbox', { name: 'Role Key' }),
          ).toHaveValue('TEST-KEY')
        })

        it('is possible to update the role key', async () => {
          const moduleAddress = randomAddress()

          mockFetchZodiacModules.mockResolvedValue([
            {
              type: SupportedZodiacModuleType.ROLES_V2,
              moduleAddress,
            },
          ])

          const route = createMockExecutionRoute({
            avatar: randomPrefixedAddress(),
            waypoints: createMockWaypoints({
              waypoints: [
                createMockRoleWaypoint({ moduleAddress, version: 2 }),
              ],
            }),
          })

          await render(`/edit-route/${encode(route)}`)

          await waitFor(async () =>
            expect(
              await screen.findByRole('textbox', { name: 'Role Key' }),
            ).not.toBeDisabled(),
          )

          await userEvent.type(
            await screen.findByRole('textbox', { name: 'Role Key' }),
            'MANAGER',
          )

          await userEvent.click(
            screen.getByRole('button', { name: 'Save & Close' }),
          )

          expect(mockPostMessage).toHaveBeenCalledWith(
            {
              type: CompanionAppMessageType.SAVE_ROUTE,
              data: updateRoleId(route, encodeRoleKey('MANAGER')),
            },
            expect.anything(),
          )
        })
      })
    })
  })

  describe('Dry run', () => {
    it('is possible to test a route before saving', async () => {
      const route = createMockExecutionRoute()

      await render(`/edit-route/${encode(route)}`)

      expect(
        screen.getByRole('button', { name: 'Test route' }),
      ).toBeInTheDocument()
    })

    it('shows errors returned by dry run', async () => {
      const route = createMockExecutionRoute()

      await render(`/edit-route/${encode(route)}`)

      mockDryRun.mockResolvedValue({
        error: true,
        message: 'Something went wrong',
      })

      await userEvent.click(screen.getByRole('button', { name: 'Test route' }))

      expect(
        await screen.findByRole('alert', { name: 'Dry run failed' }),
      ).toHaveAccessibleDescription('Something went wrong')
    })
  })
})
