import { render } from '@/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain, CHAIN_NAME, ZERO_ADDRESS } from '@zodiac/chains'
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
import type { initSafeApiKit } from '@zodiac/safe'
import { ProviderType } from '@zodiac/schema'
import {
  createMockEndWaypoint,
  createMockExecutionRoute,
  createMockRoleWaypoint,
  createMockStartingWaypoint,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { chromeMock } from '@zodiac/test-utils/chrome'
import { formatPrefixedAddress, type ChainId } from 'ser-kit'
import { describe, expect, it, vi } from 'vitest'

const { mockGetSafesByOwner } = vi.hoisted(() => ({
  mockGetSafesByOwner:
    vi.fn<ReturnType<typeof initSafeApiKit>['getSafesByOwner']>(),
}))

vi.mock('@zodiac/safe', async (importOriginal) => {
  const module = await importOriginal<typeof import('@zodiac/safe')>()

  return {
    ...module,

    initSafeApiKit: (chainId: ChainId) => {
      return {
        ...module.initSafeApiKit(chainId),
        getSafesByOwner: mockGetSafesByOwner,
      }
    },
  }
})

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

describe('Edit route', () => {
  describe('Label', () => {
    it('shows the name of a route', async () => {
      const route = createMockExecutionRoute({ label: 'Test route' })

      await render(`/edit-route/${btoa(JSON.stringify(route))}`)

      expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue(
        'Test route',
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

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        expect(screen.getByText(name)).toBeInTheDocument()
      },
    )
  })

  describe('Pilot Account', () => {
    it('offers a button to connect', async () => {
      const route = createMockExecutionRoute()

      await render(`/edit-route/${btoa(JSON.stringify(route))}`)

      expect(
        screen.getByRole('button', { name: 'Connect wallet' }),
      ).toBeInTheDocument()
    })

    describe('MetaMask', () => {
      it('shows MetaMask as the provider of a route', async () => {
        const route = createMockExecutionRoute({
          waypoints: [createMockStartingWaypoint()],
          providerType: ProviderType.InjectedWallet,
        })

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        expect(
          screen.getByRole('textbox', { name: 'Pilot Account' }),
        ).toHaveAccessibleDescription('MetaMask')
      })
    })

    describe('Wallet Connect', () => {
      it('shows Wallet Connect as the provider of a route', async () => {
        const route = createMockExecutionRoute({
          waypoints: [createMockStartingWaypoint()],
          providerType: ProviderType.WalletConnect,
        })

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        expect(
          screen.getByRole('textbox', { name: 'Pilot Account' }),
        ).toHaveAccessibleDescription('Wallet Connect')
      })
    })
  })

  describe('Avatar', () => {
    it('shows the avatar of a route', async () => {
      const avatar = randomAddress()

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ address: avatar }),
      })

      await render(`/edit-route/${btoa(JSON.stringify(route))}`)

      expect(screen.getByText(avatar)).toBeInTheDocument()
    })

    it('offers safes that are owned by the user', async () => {
      const safe = randomAddress()

      mockGetSafesByOwner.mockResolvedValue({ safes: [safe] })

      const route = createMockExecutionRoute({
        waypoints: [createMockStartingWaypoint()],
        providerType: ProviderType.InjectedWallet,
      })

      await render(`/edit-route/${btoa(JSON.stringify(route))}`)

      await userEvent.click(
        screen.getByRole('button', { name: 'View all available Safes' }),
      )

      expect(screen.getByRole('option', { name: safe })).toBeInTheDocument()
    })

    describe('Edit', () => {
      it('is possible to select a safe from the list', async () => {
        const safe = randomAddress()

        mockGetSafesByOwner.mockResolvedValue({ safes: [safe] })

        const route = createMockExecutionRoute({
          waypoints: [createMockStartingWaypoint()],
          providerType: ProviderType.InjectedWallet,
        })

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        await userEvent.click(
          screen.getByRole('button', { name: 'View all available Safes' }),
        )

        await userEvent.click(screen.getByRole('option', { name: safe }))

        await userEvent.click(screen.getByRole('button', { name: 'Save' }))

        expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(
          expect.anything(),
          updateAvatar(route, { safe }),
        )
      })

      it('is possible to type in an address', async () => {
        const safe = randomAddress()

        mockGetSafesByOwner.mockResolvedValue({ safes: [] })

        const route = createMockExecutionRoute({
          avatar: formatPrefixedAddress(Chain.ETH, ZERO_ADDRESS),
          waypoints: [createMockStartingWaypoint()],
          providerType: ProviderType.InjectedWallet,
        })

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        await userEvent.type(
          screen.getByRole('textbox', { name: 'Piloted Safe' }),
          safe,
        )
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))

        expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(
          expect.anything(),
          updateAvatar(route, { safe }),
        )
      })

      it('is possible to remove the avatar', async () => {
        const safe = randomAddress()

        const route = createMockExecutionRoute({
          avatar: formatPrefixedAddress(Chain.ETH, safe),
          waypoints: [
            createMockStartingWaypoint(),
            createMockEndWaypoint({ address: safe }),
          ],
          providerType: ProviderType.InjectedWallet,
        })

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        await userEvent.click(
          screen.getByRole('button', { name: 'Clear piloted Safe' }),
        )
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))

        expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(
          expect.anything(),
          removeAvatar(route),
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
        waypoints: [
          createMockStartingWaypoint(),
          createMockRoleWaypoint({ moduleAddress: selectedMod, version: 1 }),
          createMockEndWaypoint(),
        ],
        providerType: ProviderType.InjectedWallet,
      })

      await render(`/edit-route/${btoa(JSON.stringify(route))}`)

      await userEvent.click(
        screen.getByRole('combobox', { name: 'Zodiac Mod' }),
      )
      await userEvent.click(screen.getByRole('option', { name: 'Roles v2' }))

      expect(await screen.findByText('Roles v2')).toBeInTheDocument()
    })

    it('reloads the modules when the chain changes', async () => {
      mockFetchZodiacModules.mockResolvedValue([])

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ chainId: Chain.ETH }),
        providerType: ProviderType.InjectedWallet,
        waypoints: [createMockStartingWaypoint(), createMockEndWaypoint()],
      })

      await render(`/edit-route/${btoa(JSON.stringify(route))}`)

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
          waypoints: [
            createMockStartingWaypoint(),
            createMockRoleWaypoint({ moduleAddress, version: 1 }),
          ],
          providerType: ProviderType.InjectedWallet,
        })

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        expect(screen.getByText('Roles v1')).toBeInTheDocument()
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
          waypoints: [createMockStartingWaypoint(), createMockEndWaypoint()],
          providerType: ProviderType.InjectedWallet,
        })

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        await userEvent.click(
          screen.getByRole('combobox', { name: 'Zodiac Mod' }),
        )
        await userEvent.click(screen.getByRole('option', { name: 'Roles v1' }))

        expect(await screen.findByText('Roles v1')).toBeInTheDocument()
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
            providerType: ProviderType.InjectedWallet,
            waypoints: [
              createMockStartingWaypoint(),
              createMockRoleWaypoint({ moduleAddress, roleId, version: 1 }),
            ],
          })

          await render(`/edit-route/${btoa(JSON.stringify(route))}`)

          expect(screen.getByRole('textbox', { name: 'Role ID' })).toHaveValue(
            roleId,
          )
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
            providerType: ProviderType.InjectedWallet,
            waypoints: [
              createMockStartingWaypoint(),
              createMockRoleWaypoint({ moduleAddress, version: 1 }),
            ],
          })

          await render(`/edit-route/${btoa(JSON.stringify(route))}`)

          const roleId = randomAddress()

          await userEvent.type(
            screen.getByRole('textbox', { name: 'Role ID' }),
            roleId,
          )

          await userEvent.click(screen.getByRole('button', { name: 'Save' }))

          expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(
            expect.anything(),
            updateRoleId(route, roleId),
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
          waypoints: [
            createMockStartingWaypoint(),
            createMockRoleWaypoint({ moduleAddress, version: 2 }),
          ],
          providerType: ProviderType.InjectedWallet,
        })

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        expect(screen.getByText('Roles v2')).toBeInTheDocument()
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
          waypoints: [createMockStartingWaypoint(), createMockEndWaypoint()],
          providerType: ProviderType.InjectedWallet,
        })

        await render(`/edit-route/${btoa(JSON.stringify(route))}`)

        await userEvent.click(
          screen.getByRole('combobox', { name: 'Zodiac Mod' }),
        )
        await userEvent.click(screen.getByRole('option', { name: 'Roles v2' }))

        expect(await screen.findByText('Roles v2')).toBeInTheDocument()
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
            avatar: formatPrefixedAddress(
              Chain.ETH,
              '0x58e6c7ab55Aa9012eAccA16d1ED4c15795669E1C',
            ),
            waypoints: [
              createMockStartingWaypoint(),
              createMockRoleWaypoint({
                moduleAddress,
                roleId: encodeRoleKey('TEST-KEY'),
                version: 2,
              }),
            ],
            providerType: ProviderType.InjectedWallet,
          })

          await render(`/edit-route/${btoa(JSON.stringify(route))}`)

          expect(screen.getByRole('textbox', { name: 'Role Key' })).toHaveValue(
            'TEST-KEY',
          )
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
            providerType: ProviderType.InjectedWallet,
            waypoints: [
              createMockStartingWaypoint(),
              createMockRoleWaypoint({ moduleAddress, version: 2 }),
            ],
          })

          await render(`/edit-route/${btoa(JSON.stringify(route))}`)

          await userEvent.type(
            screen.getByRole('textbox', { name: 'Role Key' }),
            'MANAGER',
          )

          await userEvent.click(screen.getByRole('button', { name: 'Save' }))

          expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(
            expect.anything(),
            updateRoleId(route, encodeRoleKey('MANAGER')),
          )
        })
      })
    })
  })
})
