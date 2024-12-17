import {
  callListeners,
  createMockPort,
  createTransaction,
  MockProvider,
  mockRoute,
  mockRoutes,
  mockRuntimeConnect,
  randomPrefixedAddress,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Transactions } from './Transactions'

describe('Transactions', () => {
  describe('List', () => {
    it('lists transactions', async () => {
      await mockRoutes()

      await render('/', [{ path: '/', Component: Transactions }], {
        initialState: [createTransaction()],
      })

      expect(
        screen.getByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })
  })

  describe('Submit', () => {
    it('disables the submit button when the runtime port disconnects', async () => {
      const initiator = randomPrefixedAddress()
      const route = await mockRoute({
        id: 'test-route',
        initiator,
      })

      const runtimePort = createMockPort()

      mockRuntimeConnect(runtimePort)

      const provider = new MockProvider()

      await render(
        '/test-route',
        [{ path: '/:activeRouteId', Component: Transactions }],
        {
          initialState: [createTransaction()],
          initialSelectedRoute: route,
          initialProvider: provider,
        },
      )

      provider.makeReady(initiator)

      await callListeners(runtimePort.onDisconnect, runtimePort)

      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    })
  })
})
