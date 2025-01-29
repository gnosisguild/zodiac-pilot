import {
  createMockRoute,
  createTransaction,
  mockRoute,
  mockTabSwitch,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
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

    it('shows that transactions cannot be recorded when Pilot is not ready, yet', async () => {
      await render(
        '/test-route/transactions',
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
        { initialSelectedRoute: createMockRoute({ id: 'test-route' }) },
      )

      await mockTabSwitch({ url: 'chrome://extensions' })

      expect(
        screen.getByRole('heading', { name: 'Not recording transactions' }),
      ).toHaveAccessibleDescription('Recording starts when Pilot connects')
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

  describe.only('Submit', () => {
    it('disables the submit button when there are no transactions', async () => {
      await render(
        '/test-route/transactions',
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
        {
          initialState: [],
          initialSelectedRoute: createMockRoute({ id: 'test-route' }),
        },
      )

      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    })
    it.todo(
      'encodes the route and transaction state into the target of the submit button',
    )
    it.todo(
      'indicates when the extension waits for transactions to be submitted',
    )
    it.todo('hides the submit notification when a success message arrives')
    it.todo('clears all transactions when a success message arrives')
    it.todo(
      'does not clear transactions when the user hides the submit notification',
    )
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
        `http://localhost/edit-route/${btoa(JSON.stringify(route))}`,
      )
    })
  })
})
