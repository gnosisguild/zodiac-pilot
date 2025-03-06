import {
  chromeMock,
  createMockRoute,
  createTransaction,
  mockRoute,
  randomPrefixedAddress,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getCompanionAppUrl } from '@zodiac/env'
import { encode } from '@zodiac/schema'
import { mockTab } from '@zodiac/test-utils/chrome'
import { describe, expect, it, vi } from 'vitest'
import { action, Transactions } from './Transactions'

vi.mock('@zodiac/env', async (importOriginal) => {
  const module = await importOriginal<typeof import('@zodiac/env')>()

  return {
    ...module,

    getCompanionAppUrl: vi.fn(),
  }
})

const mockGetCompanionAppUrl = vi.mocked(getCompanionAppUrl)

describe('Transactions', () => {
  describe('Recording state', () => {
    it('hides the info when Pilot is ready', async () => {
      await render(
        '/test-route/transactions',
        [
          {
            path: '/:activeRouteId/transactions',
            Component: Transactions,
            action,
          },
        ],
        { initialSelectedRoute: createMockRoute({ id: 'test-route' }) },
      )

      expect(
        screen.getByRole('heading', { name: 'Recording transactions' }),
      ).not.toHaveAccessibleDescription()
    })
  })

  describe('List', () => {
    it('lists transactions', async () => {
      await render(
        '/test-route/transactions',
        [
          {
            path: '/:activeRouteId/transactions',
            Component: Transactions,
            action,
          },
        ],
        {
          initialState: [createTransaction()],
          initialSelectedRoute: createMockRoute({ id: 'test-route' }),
        },
      )

      expect(
        screen.getByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })
  })

  describe('Submit', () => {
    it('disables the submit button when there are no transactions', async () => {
      await render(
        '/test-route/transactions',
        [
          {
            path: '/:activeRouteId/transactions',
            Component: Transactions,
            action,
          },
        ],
        {
          initialState: [],
          initialSelectedRoute: createMockRoute({
            id: 'test-route',
            initiator: randomPrefixedAddress(),
          }),
        },
      )

      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    })

    it('encodes the route and transaction state into the target of the submit button', async () => {
      const route = createMockRoute({
        id: 'test-route',
        initiator: randomPrefixedAddress(),
      })
      const transaction = createTransaction()

      await render(
        '/test-route/transactions',
        [
          {
            path: '/:activeRouteId/transactions',
            Component: Transactions,
            action,
          },
        ],
        {
          initialState: [transaction],
          initialSelectedRoute: route,
          companionAppUrl: 'http://localhost',
        },
      )

      expect(screen.getByRole('link', { name: 'Submit' })).toHaveAttribute(
        'href',
        `http://localhost/submit/${encode(route)}/${encode([transaction.transaction])}`,
      )
    })

    it('offers a link to complete the route setup when no initiator is defined', async () => {
      const route = await mockRoute({
        id: 'test-route',
      })

      mockGetCompanionAppUrl.mockReturnValue('http://localhost')

      await render(
        '/test-route/transactions',
        [
          {
            path: '/:activeRouteId/transactions',
            Component: Transactions,
            action,
          },
        ],
        {
          initialState: [],
          initialSelectedRoute: route,
          companionAppUrl: 'http://localhost',
        },
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Complete route setup to submit' }),
      )

      expect(chromeMock.tabs.create).toHaveBeenCalledWith({
        active: true,
        url: `http://localhost/edit/${route.id}/${encode(route)}`,
      })
    })
  })

  describe('Edit', () => {
    describe('Current route', () => {
      it('is possible to edit the current route', async () => {
        const route = await mockRoute({ id: 'test-route' })

        mockGetCompanionAppUrl.mockReturnValue('http://localhost')

        await render(
          '/test-route/transactions',
          [
            {
              path: '/:activeRouteId/transactions',
              Component: Transactions,
              action,
            },
          ],
          {
            initialState: [createTransaction()],
            initialSelectedRoute: route,
          },
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Edit account' }),
        )

        expect(chromeMock.tabs.create).toHaveBeenCalledWith({
          active: true,
          url: `http://localhost/edit/${route.id}/${encode(route)}`,
        })
      })

      it('activates an existing tab when it already exists', async () => {
        const route = await mockRoute({ id: 'test-route' })
        mockGetCompanionAppUrl.mockReturnValue('http://localhost')

        const tab = mockTab({
          url: `http://localhost/edit/${route.id}/some-old-route-data`,
        })

        await render(
          '/test-route/transactions',
          [
            {
              path: '/:activeRouteId/transactions',
              Component: Transactions,
              action,
            },
          ],
          {
            initialState: [createTransaction()],
            initialSelectedRoute: route,
          },
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Edit account' }),
        )

        expect(chromeMock.tabs.update).toHaveBeenCalledWith(tab.id, {
          active: true,
          url: `http://localhost/edit/${route.id}/${encode(route)}`,
        })
      })
    })

    describe('List all routes', () => {
      it('is possible to see all routes', async () => {
        const route = await mockRoute({ id: 'test-route' })
        mockGetCompanionAppUrl.mockReturnValue('http://localhost')

        await render(
          '/test-route/transactions',
          [
            {
              path: '/:activeRouteId/transactions',
              Component: Transactions,
              action,
            },
          ],
          {
            initialState: [],
            initialSelectedRoute: route,
          },
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'List accounts' }),
        )

        expect(chromeMock.tabs.create).toHaveBeenCalledWith({
          active: true,
          url: 'http://localhost/edit',
        })
      })

      it('activates an existing tab when it already exists', async () => {
        const route = await mockRoute({ id: 'test-route' })

        mockGetCompanionAppUrl.mockReturnValue('http://localhost')

        const tab = mockTab({
          url: `http://localhost/edit`,
        })

        await render(
          '/test-route/transactions',
          [
            {
              path: '/:activeRouteId/transactions',
              Component: Transactions,
              action,
            },
          ],
          {
            initialState: [],
            initialSelectedRoute: route,
          },
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'List accounts' }),
        )

        expect(chromeMock.tabs.update).toHaveBeenCalledWith(tab.id, {
          active: true,
        })
      })
    })
  })

  describe('Token actions', () => {
    it('shows a link to view the current balances', async () => {
      const route = await mockRoute({ id: 'test-route' })

      await render(
        '/test-route/transactions',
        [
          {
            path: '/:activeRouteId/transactions',
            Component: Transactions,
            action,
          },
        ],
        {
          initialState: [createTransaction()],
          initialSelectedRoute: route,
          companionAppUrl: 'http://localhost',
        },
      )

      expect(
        screen.getByRole('link', { name: 'View balances' }),
      ).toHaveAttribute('href', 'http://localhost/tokens/balances')
    })

    it('offers to send tokens', async () => {
      const route = await mockRoute({ id: 'test-route' })

      await render(
        '/test-route/transactions',
        [
          {
            path: '/:activeRouteId/transactions',
            Component: Transactions,
            action,
          },
        ],
        {
          initialState: [createTransaction()],
          initialSelectedRoute: route,
          companionAppUrl: 'http://localhost',
        },
      )

      expect(screen.getByRole('link', { name: 'Send tokens' })).toHaveAttribute(
        'href',
        'http://localhost/tokens/send',
      )
    })
  })
})
