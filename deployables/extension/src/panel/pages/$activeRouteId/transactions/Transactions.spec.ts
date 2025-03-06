import {
  createMockRoute,
  createTransaction,
  mockRoute,
  randomPrefixedAddress,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import { encode } from '@zodiac/schema'
import { describe, expect, it } from 'vitest'
import { Transactions } from './Transactions'

describe('Transactions', () => {
  describe('Recording state', () => {
    it('hides the info when Pilot is ready', async () => {
      await render(
        '/test-route/transactions',
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
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
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
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
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
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
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
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
      const route = createMockRoute({
        id: 'test-route',
      })

      await render(
        '/test-route/transactions',
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
        {
          initialState: [],
          initialSelectedRoute: route,
          companionAppUrl: 'http://localhost',
        },
      )

      expect(
        screen.getByRole('link', { name: 'Complete route setup to submit' }),
      ).toHaveAttribute(
        'href',
        `http://localhost/edit/${route.id}/${encode(route)}`,
      )
    })
  })

  describe('Edit', () => {
    it('is possible to edit the current route', async () => {
      const route = await mockRoute({ id: 'test-route' })

      await render(
        '/test-route/transactions',
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
        {
          initialState: [createTransaction()],
          initialSelectedRoute: route,
          companionAppUrl: 'http://localhost',
        },
      )

      expect(screen.getByRole('link', { name: 'Edit route' })).toHaveAttribute(
        'href',
        `http://localhost/edit/${route.id}/${encode(route)}`,
      )
    })
  })

  describe('Token actions', () => {
    it('shows a link to view the current balances', async () => {
      const route = await mockRoute({ id: 'test-route' })

      await render(
        '/test-route/transactions',
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
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
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
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
