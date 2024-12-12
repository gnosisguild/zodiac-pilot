import { ZERO_ADDRESS } from '@/chains'
import { getReadOnlyProvider, useInjectedWallet } from '@/providers'
import {
  chromeMock,
  expectRouteToBe,
  MockProvider,
  mockRoute,
  mockRoutes,
  render,
} from '@/test-utils'
import { ProviderType } from '@/types'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { formatPrefixedAddress } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditRoute, loader } from './EditRoute'

vi.mock('@/providers', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/providers')>()

  return {
    ...module,

    getReadOnlyProvider: vi.fn(module.getReadOnlyProvider),
    useInjectedWallet: vi.fn(module.useInjectedWallet),
  }
})

const mockGetReadOnlyProvider = vi.mocked(getReadOnlyProvider)
const mockUseInjectedWallet = vi.mocked(useInjectedWallet)

describe('Edit Zodiac route', () => {
  beforeEach(() => {
    mockUseInjectedWallet.mockRestore()
  })

  describe('Label', () => {
    it('is possible to rename a route', async () => {
      mockRoute({ id: 'route-id' })

      await render('/routes/route-id', [
        {
          path: '/routes/:routeId',
          Component: EditRoute,
          loader,
        },
      ])

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Route label' }),
        'Test route',
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        'routes[route-id]': expect.objectContaining({ label: 'Test route' }),
      })
    })
  })

  describe('Remove', () => {
    it('is possible to remove a route', async () => {
      mockRoute({ id: 'route-id' })

      await render('/routes/route-id', [
        {
          path: '/routes/:routeId',
          Component: EditRoute,
          loader,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' }),
      )

      const { getByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Remove' }))

      expect(chromeMock.storage.sync.remove).toHaveBeenCalledWith(
        'routes[route-id]',
      )
    })

    it('does not remove the route if the user cancels', async () => {
      mockRoute({ id: 'route-id' })

      await render('/routes/route-id', [
        {
          path: '/routes/:routeId',
          Component: EditRoute,
          loader,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' }),
      )

      const { getAllByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getAllByRole('button', { name: 'Cancel' })[0])

      expect(chromeMock.storage.sync.remove).not.toHaveBeenCalledWith()
    })

    it('navigates back to all routes after remove', async () => {
      mockRoute({ id: 'route-id' })

      await render(
        '/routes/route-id',
        [
          {
            path: '/routes/:routeId',
            Component: EditRoute,
            loader,
          },
        ],
        { inspectRoutes: ['/routes'] },
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' }),
      )

      const { getByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Remove' }))

      await expectRouteToBe('/routes')
    })
  })

  describe('Switch chain', () => {
    it('is possible to switch the chain of an injected wallet', async () => {
      mockRoute({
        id: 'routeId',
        providerType: ProviderType.InjectedWallet,
        initiator: formatPrefixedAddress(
          1,
          '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        ),
        avatar: formatPrefixedAddress(10, ZERO_ADDRESS),
      })

      const switchChain = vi.fn()

      mockUseInjectedWallet.mockReturnValue({
        accounts: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
        chainId: 1,
        ready: true,
        connectionStatus: 'connected',
        connect: vi.fn(),
        switchChain,
        provider: new MockProvider(),
      })

      await render('/routes/routeId', [
        { path: '/routes/:routeId', Component: EditRoute, loader },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Switch wallet to Optimism' }),
      )

      expect(switchChain).toHaveBeenCalledWith(10)
    })
  })

  describe('New route', () => {
    it('uses the correct chain to fetch zodiac modules', async () => {
      mockRoutes()

      await render('/routes/route-id', [
        {
          path: '/routes/:routeId',
          Component: EditRoute,
          loader,
        },
      ])

      await userEvent.click(screen.getByRole('combobox', { name: 'Chain' }))
      await userEvent.click(
        screen.getByRole('option', { name: 'Arbitrum One' }),
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Piloted Safe' }),
        '0x5a064eC22bf46dfFAb8a23b52a442FC98bBBD0Fb',
      )

      expect(mockGetReadOnlyProvider).toHaveBeenCalledWith(42161)
    })
  })
})
