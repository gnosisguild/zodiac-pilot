import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain, CHAIN_NAME } from '@zodiac/chains'
import {
  encodeRoleKey,
  fetchZodiacModules,
  SupportedZodiacModuleType,
} from '@zodiac/modules'
import type { initSafeApiKit } from '@zodiac/safe'
import { ProviderType } from '@zodiac/schema'
import {
  createMockExecutionRoute,
  createRoleWaypoint,
  createStartingWaypoint,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
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
  }
})

const mockFetchZodiacModules = vi.mocked(fetchZodiacModules)

describe('Edit route', () => {
  describe('Label', () => {
    it('shows the name of a route', async () => {
      const route = createMockExecutionRoute({ label: 'Test route' })

      await render('/edit-route', {
        searchParams: { route: btoa(JSON.stringify(route)) },
      })

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

        await render('/edit-route', {
          searchParams: { route: btoa(JSON.stringify(route)) },
        })

        expect(screen.getByText(name)).toBeInTheDocument()
      },
    )
  })

  describe('Pilot Account', () => {
    it('offers a button to connect', async () => {
      const route = createMockExecutionRoute()

      await render('/edit-route', {
        searchParams: { route: btoa(JSON.stringify(route)) },
      })

      expect(
        screen.getByRole('button', { name: 'Connect wallet' }),
      ).toBeInTheDocument()
    })

    describe('MetaMask', () => {
      it('shows MetaMask as the provider of a route', async () => {
        const route = createMockExecutionRoute({
          waypoints: [createStartingWaypoint()],
          providerType: ProviderType.InjectedWallet,
        })

        await render('/edit-route', {
          searchParams: { route: btoa(JSON.stringify(route)) },
        })

        expect(
          screen.getByRole('textbox', { name: 'Pilot Account' }),
        ).toHaveAccessibleDescription('MetaMask')
      })
    })

    describe('Wallet Connect', () => {
      it('shows Wallet Connect as the provider of a route', async () => {
        const route = createMockExecutionRoute({
          waypoints: [createStartingWaypoint()],
          providerType: ProviderType.WalletConnect,
        })

        await render('/edit-route', {
          searchParams: { route: btoa(JSON.stringify(route)) },
        })

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

      await render('/edit-route', {
        searchParams: { route: btoa(JSON.stringify(route)) },
      })

      expect(screen.getByText(avatar)).toBeInTheDocument()
    })

    it('offers safes that are owned by the user', async () => {
      const safe = randomAddress()

      mockGetSafesByOwner.mockResolvedValue({ safes: [safe] })

      const route = createMockExecutionRoute({
        waypoints: [createStartingWaypoint()],
        providerType: ProviderType.InjectedWallet,
      })

      await render('/edit-route', {
        searchParams: { route: btoa(JSON.stringify(route)) },
      })

      await userEvent.click(
        screen.getByRole('button', { name: 'View all available Safes' }),
      )

      expect(screen.getByRole('option', { name: safe })).toBeInTheDocument()
    })
  })

  describe('Role', () => {
    it('shows the role of a route', async () => {
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
          createStartingWaypoint(),
          createRoleWaypoint({ moduleAddress }),
        ],
        providerType: ProviderType.InjectedWallet,
      })

      await render('/edit-route', {
        searchParams: { route: btoa(JSON.stringify(route)) },
      })

      expect(screen.getByText('Roles v2')).toBeInTheDocument()
    })

    it.only('is possible to change the mod of a route', async () => {
      mockFetchZodiacModules.mockResolvedValue([
        {
          type: SupportedZodiacModuleType.ROLES_V2,
          moduleAddress: randomAddress(),
        },
      ])

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress(),
        waypoints: [createStartingWaypoint()],
        providerType: ProviderType.InjectedWallet,
      })

      await render('/edit-route', {
        searchParams: { route: btoa(JSON.stringify(route)) },
      })

      await userEvent.click(
        screen.getByRole('combobox', { name: 'Zodiac Mod' }),
      )
      await userEvent.click(screen.getByRole('option', { name: 'Roles v2' }))

      expect(screen.getByText('Roles v2')).toBeInTheDocument()
    })

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
        avatar: formatPrefixedAddress(
          Chain.ETH,
          '0x58e6c7ab55Aa9012eAccA16d1ED4c15795669E1C',
        ),
        waypoints: [
          createStartingWaypoint(),
          createRoleWaypoint({ moduleAddress, roleId, version: 1 }),
        ],
        providerType: ProviderType.InjectedWallet,
      })

      await render('/edit-route', {
        searchParams: { route: btoa(JSON.stringify(route)) },
      })

      expect(screen.getByRole('textbox', { name: 'Role ID' })).toHaveValue(
        roleId,
      )
    })

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
          createStartingWaypoint(),
          createRoleWaypoint({
            moduleAddress,
            roleId: encodeRoleKey('TEST-KEY'),
            version: 2,
          }),
        ],
        providerType: ProviderType.InjectedWallet,
      })

      await render('/edit-route', {
        searchParams: { route: btoa(JSON.stringify(route)) },
      })

      expect(screen.getByRole('textbox', { name: 'Role Key' })).toHaveValue(
        'TEST-KEY',
      )
    })
  })
})
