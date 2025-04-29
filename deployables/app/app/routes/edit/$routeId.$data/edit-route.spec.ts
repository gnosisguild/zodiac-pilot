import { getAvailableChains } from '@/balances-server'
import { createMockChain, expectMessage, render } from '@/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain, CHAIN_NAME, verifyChainId } from '@zodiac/chains'
import { CompanionAppMessageType } from '@zodiac/messages'
import { createBlankRoute, updateAvatar, updateChainId } from '@zodiac/modules'
import { encode } from '@zodiac/schema'
import {
  createMockEndWaypoint,
  createMockEoaAccount,
  createMockExecutionRoute,
  createMockRoute,
  createMockSafeAccount,
  createMockStartingWaypoint,
  createMockWaypoints,
  expectRouteToBe,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { queryRoutes } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockPostMessage = vi.spyOn(window, 'postMessage')

const mockGetAvailableChains = vi.mocked(getAvailableChains)

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    queryRoutes: vi.fn(),
  }
})

const mockQueryRoutes = vi.mocked(queryRoutes)

describe('Edit route', () => {
  beforeEach(() => {
    mockGetAvailableChains.mockResolvedValue(
      Object.entries(CHAIN_NAME).map(([chainId, name]) =>
        createMockChain({
          name,
          community_id: parseInt(chainId),
          logo_url: 'http://chain-img.com',
        }),
      ),
    )
  })

  describe('Label', () => {
    beforeEach(() => {
      mockQueryRoutes.mockResolvedValue([])
    })

    it('shows the name of a route', async () => {
      const route = createMockExecutionRoute({ label: 'Test route' })

      await render(
        href('/edit/:routeId/:data', {
          routeId: route.id,
          data: encode(route),
        }),
      )

      expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue(
        'Test route',
      )
    })

    it('is possible to change the label of a route', async () => {
      const route = createMockExecutionRoute({
        initiator: randomPrefixedAddress(),
      })

      await render(
        href('/edit/:routeId/:data', {
          routeId: route.id,
          data: encode(route),
        }),
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Label' }),
        'New route label',
      )

      await userEvent.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(mockPostMessage).toHaveBeenCalledWith(
          {
            type: CompanionAppMessageType.SAVE_ROUTE,
            data: expect.objectContaining({ label: 'New route label' }),
          },
          expect.anything(),
        )
      })
    })
  })

  describe('Chain', () => {
    it.each(Object.entries(CHAIN_NAME))(
      'shows chainId "%s" as "%s"',
      async (chainId, name) => {
        const route = updateChainId(
          updateAvatar(createBlankRoute(), { safe: randomAddress() }),
          verifyChainId(parseInt(chainId)),
        )

        await render(
          href('/edit/:routeId/:data', {
            routeId: route.id,
            data: encode(route),
          }),
        )

        expect(screen.getByText(name)).toBeInTheDocument()
      },
    )

    // This test even if it should work. It seems like
    // an issue within react router. I'll keep it around
    // and try with the next patch releases
    it.skip('is possible to update the chain', async () => {
      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ chainId: Chain.ETH }),
      })

      await render(
        href('/edit/:routeId/:data', {
          routeId: route.id,
          data: encode(route),
        }),
      )

      await userEvent.click(screen.getByRole('combobox', { name: 'Chain' }))
      await userEvent.click(screen.getByRole('option', { name: 'Gnosis' }))

      await expectRouteToBe(`/edit/${encode(updateChainId(route, Chain.GNO))}`)
    })
  })

  describe('Route', () => {
    it('is auto-selects the first route', async () => {
      const route = createMockExecutionRoute({
        id: 'current',
        label: 'Current route',

        initiator: randomPrefixedAddress(),
      })

      const waypoints = createMockWaypoints({
        start: createMockStartingWaypoint(createMockEoaAccount()),
        end: createMockEndWaypoint({ account: createMockSafeAccount() }),
      })

      const newRoute = createMockRoute({ id: 'first', waypoints })

      mockQueryRoutes.mockResolvedValue([newRoute])

      await render(
        href('/edit/:routeId/:data', {
          routeId: route.id,
          data: encode(route),
        }),
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await expectMessage({
        type: CompanionAppMessageType.SAVE_ROUTE,
        data: expect.objectContaining({
          waypoints: newRoute.waypoints,

          id: route.id,
          label: route.label,
        }),
      })
    })
  })

  describe('Save as', () => {
    it('is possible to save the route as a copy', async () => {
      const route = createMockExecutionRoute()

      await render(
        href('/edit/:routeId/:data', {
          routeId: route.id,
          data: encode(route),
        }),
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Label' }),
        'New route',
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Show save options' }),
      )
      await userEvent.click(
        screen.getByRole('menuitem', { name: 'Save as copy' }),
      )

      await expectMessage({
        type: CompanionAppMessageType.SAVE_ROUTE,
        data: {
          ...route,

          id: expect.stringMatching(new RegExp(`^(?!${route.id}$).*`)),
          label: 'New route',
        },
      })
    })

    it('adds the word "Copy" to the label if it was not changed', async () => {
      const route = createMockExecutionRoute({ label: 'Test route' })

      await render(
        href('/edit/:routeId/:data', {
          routeId: route.id,
          data: encode(route),
        }),
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Show save options' }),
      )
      await userEvent.click(
        screen.getByRole('menuitem', { name: 'Save as copy' }),
      )

      await expectMessage({
        type: CompanionAppMessageType.SAVE_ROUTE,
        data: expect.objectContaining({
          label: 'Test route (copy)',
        }),
      })
    })
  })
})
