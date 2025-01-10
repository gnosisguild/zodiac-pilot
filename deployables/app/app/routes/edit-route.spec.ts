import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { CHAIN_NAME } from '@zodiac/chains'
import { ProviderType } from '@zodiac/schema'
import {
  createMockExecutionRoute,
  createStartingWaypoint,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import type { ChainId } from 'ser-kit'
import { describe, expect, it } from 'vitest'

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
      throw new Error('Not implemented')
    })
  })
})
