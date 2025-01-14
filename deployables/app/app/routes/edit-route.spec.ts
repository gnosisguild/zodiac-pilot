import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CHAIN_NAME } from '@zodiac/chains'
import type { initSafeApiKit } from '@zodiac/safe'
import { ProviderType } from '@zodiac/schema'
import {
  createMockExecutionRoute,
  createRoleWaypoint,
  createStartingWaypoint,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import type { ChainId } from 'ser-kit'
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
    it.only('shows the role of a route', async () => {
      const route = createMockExecutionRoute({
        waypoints: [createStartingWaypoint(), createRoleWaypoint()],
        providerType: ProviderType.InjectedWallet,
      })

      await render('/edit-route', {
        searchParams: { route: btoa(JSON.stringify(route)) },
      })

      expect(screen.getByText('Roles V2')).toBeInTheDocument()
    })
  })
})
