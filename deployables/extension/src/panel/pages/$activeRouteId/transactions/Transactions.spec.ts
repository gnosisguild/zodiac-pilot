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

  describe('Submit', () => {
    it('disables the submit button when the current tab goes into a state where submit is not possible', async () => {
      await render(
        '/test-route/transactions',
        [{ path: '/:activeRouteId/transactions', Component: Transactions }],
        {
          initialState: [createTransaction()],
          initialSelectedRoute: createMockRoute({ id: 'test-route' }),
        },
      )

      await mockTabSwitch({ url: 'chrome://extensions' })

      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
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
        `http://localhost/edit-route/${btoa(JSON.stringify(route))}`,
      )
    })
  })
})
