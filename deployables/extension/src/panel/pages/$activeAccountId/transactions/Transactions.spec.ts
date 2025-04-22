import {
  chromeMock,
  createTransaction,
  mockCompanionAppUrl,
  mockRoute,
  randomPrefixedAddress,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { encode } from '@zodiac/schema'
import { describe, expect, it } from 'vitest'

describe('Transactions', () => {
  describe('Recording state', () => {
    it('hides the info when Pilot is ready', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route/transactions')

      expect(
        screen.getByRole('heading', { name: 'Recording transactions' }),
      ).not.toHaveAccessibleDescription()
    })
  })

  describe('List', () => {
    it('lists transactions', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route/transactions', {
        initialState: [createTransaction()],
      })

      expect(
        screen.getByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })
  })

  describe('Submit', () => {
    it('disables the submit button when there are no transactions', async () => {
      await mockRoute({ id: 'test-route', initiator: randomPrefixedAddress() })

      await render('/test-route/transactions')

      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    })

    it('encodes the route and transaction state into the target of the submit button', async () => {
      const route = await mockRoute({
        id: 'test-route',
        initiator: randomPrefixedAddress(),
      })
      const transaction = createTransaction()

      mockCompanionAppUrl('http://localhost')

      await render('/test-route/transactions', {
        initialState: [transaction],
      })

      expect(screen.getByRole('link', { name: 'Submit' })).toHaveAttribute(
        'href',
        `http://localhost/submit/${encode(route)}/${encode([transaction.transaction])}`,
      )
    })

    it('offers a link to complete the route setup when no initiator is defined', async () => {
      const route = await mockRoute({
        id: 'test-route',
      })

      mockCompanionAppUrl('http://localhost')

      await render('/test-route/transactions')

      await userEvent.click(
        screen.getByRole('button', { name: 'Complete route setup to submit' }),
      )

      expect(chromeMock.tabs.create).toHaveBeenCalledWith({
        active: true,
        url: `http://localhost/edit/${route.id}/${encode(route)}`,
      })
    })
  })
})
