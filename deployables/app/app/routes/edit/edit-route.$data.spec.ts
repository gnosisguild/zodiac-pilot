import { getChain } from '@/balances-server'
import { createMockChain, render } from '@/test-utils'
import { dryRun } from '@/utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain, CHAIN_NAME } from '@zodiac/chains'
import { CompanionAppMessageType } from '@zodiac/messages'
import { fetchZodiacModules, removeAvatar, updateAvatar } from '@zodiac/modules'
import { encode } from '@zodiac/schema'
import {
  createMockEndWaypoint,
  createMockExecutionRoute,
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
  }
})

const mockFetchZodiacModules = vi.mocked(fetchZodiacModules)

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

    getChain: vi.fn(),
  }
})

const mockGetChain = vi.mocked(getChain)

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
        mockGetChain.mockResolvedValue(
          createMockChain({
            name,
            id: chainId,
          }),
        )

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
