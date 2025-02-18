import { getAvailableChains } from '@/balances-server'
import { createMockChain, render } from '@/test-utils'
import { dryRun } from '@/utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CHAIN_NAME, verifyChainId } from '@zodiac/chains'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
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
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { queryRoutes } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockPostMessage = vi.spyOn(window, 'postMessage')

vi.mock('@/utils', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/utils')>()

  return {
    ...module,
    dryRun: vi.fn(),
  }
})

const mockDryRun = vi.mocked(dryRun)

vi.mock('@/balances-server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/balances-server')>()

  return {
    ...module,

    getAvailableChains: vi.fn(),
  }
})

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
  describe('Label', () => {
    it('shows the name of a route', async () => {
      const route = createMockExecutionRoute({ label: 'Test route' })

      await render(`/edit/${encode(route)}`)

      expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue(
        'Test route',
      )
    })

    it('is possible to change the label of a route', async () => {
      const route = createMockExecutionRoute()

      await render(`/edit/${encode(route)}`)

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

    it.each(Object.entries(CHAIN_NAME))(
      'shows chainId "%s" as "%s"',
      async (chainId, name) => {
        const route = updateChainId(
          updateAvatar(createBlankRoute(), { safe: randomAddress() }),
          verifyChainId(parseInt(chainId)),
        )

        await render(`/edit/${encode(route)}`)

        expect(screen.getByAltText(name)).toBeInTheDocument()
      },
    )
  })

  describe('Route', () => {
    it('is possible to select a new route', async () => {
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

      await render(`/edit/${encode(route)}`)

      await userEvent.click(await screen.findByTestId(newRoute.id))
      await userEvent.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(postMessage).toHaveBeenCalledWith(
          {
            type: CompanionAppMessageType.SAVE_ROUTE,
            data: expect.objectContaining({
              waypoints: newRoute.waypoints,

              id: route.id,
              label: route.label,
            }),
          } satisfies CompanionAppMessage,
          '*',
        )
      })
    })
  })

  describe('Dry run', () => {
    beforeEach(() => {
      mockQueryRoutes.mockResolvedValue([])
    })

    it('is possible to test a route before saving', async () => {
      const route = createMockExecutionRoute()

      await render(`/edit/${encode(route)}`)

      expect(
        screen.getByRole('button', { name: 'Test route' }),
      ).toBeInTheDocument()
    })

    it('shows errors returned by dry run', async () => {
      const route = createMockExecutionRoute({
        initiator: randomPrefixedAddress(),
      })

      await render(`/edit/${encode(route)}`)

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
