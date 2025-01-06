import {
  getLastUsedRouteId,
  getRoute,
  getRoutes,
  saveLastUsedRouteId,
} from '@/execution-routes'
import { useInjectedWallet } from '@/providers'
import {
  createMockRoute,
  createRoleWaypoint,
  createStartingWaypoint,
  createTransaction,
  expectRouteToBe,
  MockProvider,
  mockRoute,
  mockRoutes,
  randomAddress,
  randomPrefixedAddress,
  render,
} from '@/test-utils'
import { ProviderType } from '@/types'
import { fetchZodiacModules, queryRolesV2MultiSend } from '@/zodiac'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getAddress } from 'ethers'
import {
  formatPrefixedAddress,
  parsePrefixedAddress,
  splitPrefixedAddress,
} from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { action, EditRoute, loader } from './EditRoute'

vi.mock('@/providers', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/providers')>()

  return {
    ...module,

    useInjectedWallet: vi.fn(module.useInjectedWallet),
  }
})

const mockUseInjectedWallet = vi.mocked(useInjectedWallet)

vi.mock('@/zodiac', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/zodiac')>()

  return {
    ...module,

    fetchZodiacModules: vi.fn(module.fetchZodiacModules),
    queryRolesV2MultiSend: vi.fn(module.queryRolesV2MultiSend),
  }
})

const mockFetchZodiacModules = vi.mocked(fetchZodiacModules)
const mockQueryRolesV2MultiSend = vi.mocked(queryRolesV2MultiSend)

describe('Edit Zodiac route', () => {
  beforeEach(() => {
    mockUseInjectedWallet.mockRestore()

    mockFetchZodiacModules.mockResolvedValue([])
  })

  describe('Label', () => {
    it('is possible to rename a route', async () => {
      mockRoute({ id: 'route-id' })

      await render('/routes/edit/route-id', [
        {
          path: '/routes/edit/:routeId',
          Component: EditRoute,
          loader,
          action,
        },
      ])

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Route label' }),
        'Test route',
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      await expect(getRoute('route-id')).resolves.toHaveProperty(
        'label',
        'Test route',
      )
    })
  })

  describe('Chain', () => {
    it('is possible to switch the chain of a route', async () => {
      const avatarAddress = randomAddress()

      mockRoute({
        id: 'route-id',
        avatar: formatPrefixedAddress(1, avatarAddress),
      })

      await render('/routes/edit/route-id', [
        {
          path: '/routes/edit/:routeId',
          Component: EditRoute,
          loader,
          action,
        },
      ])

      await userEvent.click(screen.getByRole('combobox', { name: 'Chain' }))
      await userEvent.click(
        screen.getByRole('option', { name: 'Arbitrum One' }),
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      await expect(getRoute('route-id')).resolves.toHaveProperty(
        'avatar',
        formatPrefixedAddress(42161, avatarAddress).toLowerCase(),
      )
    })
  })

  describe('Pilot Account', () => {
    describe('MetaMask', () => {
      it('is possible to connect an account', async () => {
        const account = randomAddress()

        mockUseInjectedWallet.mockReturnValue({
          accounts: [account],
          chainId: 1,
          connect: vi
            .fn()
            .mockResolvedValue({ chainId: 1, accounts: [account] }),
          connectionStatus: 'disconnected',
          provider: new MockProvider(),
          ready: true,
          switchChain: vi.fn(),
        })

        mockRoute({ id: 'route-id' })

        await render('/routes/edit/route-id', [
          {
            path: '/routes/edit/:routeId',
            Component: EditRoute,
            loader,
            action,
          },
        ])

        await userEvent.click(
          screen.getByRole('button', { name: 'Connect with MetaMask' }),
        )
        await userEvent.click(
          screen.getByRole('button', { name: 'Save & Launch' }),
        )

        await expect(getRoute('route-id')).resolves.toHaveProperty(
          'initiator',
          `eoa:${account}`,
        )
      })
    })
  })

  describe('Piloted Safe', () => {
    it('is possible to define a safe', async () => {
      await mockRoute({ id: 'route-id' })

      await render('/routes/edit/route-id', [
        {
          path: '/routes/edit/:routeId',
          Component: EditRoute,
          loader,
          action,
        },
      ])

      const address = randomAddress()

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Piloted Safe' }),
        `${address}[enter]`,
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      await expect(getRoute('route-id')).resolves.toHaveProperty(
        'avatar',
        formatPrefixedAddress(1, address).toLowerCase(),
      )
    })

    it('clears the module when the piloted safe changes', async () => {
      const moduleAddress = randomAddress()

      await mockRoute({
        id: 'route-id',
        avatar: randomPrefixedAddress(),
        waypoints: [
          createStartingWaypoint(),
          createRoleWaypoint({ moduleAddress }),
        ],
      })

      mockFetchZodiacModules.mockResolvedValue([
        { moduleAddress, type: KnownContracts.ROLES_V2 },
      ])

      mockQueryRolesV2MultiSend.mockResolvedValue({})

      await render('/routes/edit/route-id', [
        {
          path: '/routes/edit/:routeId',
          Component: EditRoute,
          loader,
          action,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear piloted Safe' }),
      )

      expect(screen.queryByText('Roles v2')).not.toBeInTheDocument()
    })
  })

  describe('Zodiac modules', () => {
    it('is possible to select a zodiac mod', async () => {
      mockRoute({ id: 'route-id', avatar: randomPrefixedAddress() })

      const moduleAddress = randomAddress()

      mockFetchZodiacModules.mockResolvedValue([
        { moduleAddress, type: KnownContracts.ROLES_V2 },
      ])

      mockQueryRolesV2MultiSend.mockResolvedValue({})

      await render('/routes/edit/route-id', [
        {
          path: '/routes/edit/:routeId',
          Component: EditRoute,
          loader,
          action,
        },
      ])

      await userEvent.click(
        screen.getByRole('combobox', { name: 'Zodiac Mod' }),
      )
      await userEvent.click(
        screen.getByRole('option', {
          name: `Roles v2 ${getAddress(moduleAddress)}`,
        }),
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      const route = await getRoute('route-id')
      const [, roleWaypoint] = route.waypoints || []

      expect(roleWaypoint?.account).toHaveProperty('address', moduleAddress)
    })
  })

  describe('Remove', () => {
    it('is possible to remove a route', async () => {
      mockRoute({ id: 'route-id' })

      await render('/routes/edit/route-id', [
        {
          path: '/routes/edit/:routeId',
          Component: EditRoute,
          loader,
          action,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' }),
      )

      const { getByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Remove' }))

      await expect(getRoutes()).resolves.toEqual([])
    })

    it('does not remove the route if the user cancels', async () => {
      const route = await mockRoute({ id: 'route-id' })

      await render('/routes/edit/route-id', [
        {
          path: '/routes/edit/:routeId',
          Component: EditRoute,
          loader,
          action,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' }),
      )

      const { getAllByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getAllByRole('button', { name: 'Cancel' })[0])

      await expect(getRoutes()).resolves.toEqual([route])
    })

    it('navigates back to all routes after remove', async () => {
      await mockRoutes(
        { id: 'route-id', label: 'First route' },
        { label: 'Second route' },
      )

      await render(
        '/routes/edit/route-id',
        [
          {
            path: '/routes/edit/:routeId',
            Component: EditRoute,
            loader,
            action,
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

    it('navigates back to the root when the last route is removed', async () => {
      await mockRoutes({ id: 'route-id' })

      await render(
        '/routes/edit/route-id',
        [
          {
            path: '/routes/edit/:routeId',
            Component: EditRoute,
            loader,
            action,
          },
        ],
        { inspectRoutes: ['/'] },
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' }),
      )

      const { getByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Remove' }))

      await expectRouteToBe('/')
    })

    it('sets another route as active, when the the deleted route is currently active', async () => {
      await mockRoutes({ id: 'first-route' }, { id: 'second-route' })

      await render(
        '/routes/edit/first-route',
        [
          {
            path: '/routes/edit/:routeId',
            Component: EditRoute,
            loader,
            action,
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

      await expect(getLastUsedRouteId()).resolves.toEqual('second-route')
    })
  })

  describe('Switch chain', () => {
    it('is possible to switch the chain of an injected wallet', async () => {
      mockRoute({
        id: 'routeId',
        providerType: ProviderType.InjectedWallet,
        initiator: randomPrefixedAddress({ chainId: 1 }),
        avatar: randomPrefixedAddress({ chainId: 10 }),
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

      await render('/routes/edit/routeId', [
        {
          path: '/routes/edit/:routeId',
          Component: EditRoute,
          loader,
          action,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Switch wallet to Optimism' }),
      )

      expect(switchChain).toHaveBeenCalledWith(10)
    })
  })

  describe('New route', () => {
    it('uses the correct chain to fetch zodiac modules', async () => {
      const route = await mockRoute({ id: 'new-route' })

      await render('/routes/edit/new-route', [
        {
          path: '/routes/edit/:routeId',
          Component: EditRoute,
          loader,
          action,
        },
      ])

      await userEvent.click(screen.getByRole('combobox', { name: 'Chain' }))
      await userEvent.click(
        screen.getByRole('option', { name: 'Arbitrum One' }),
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Piloted Safe' }),
        randomAddress(),
      )

      const [, avatarAddress] = splitPrefixedAddress(route.avatar)

      expect(mockFetchZodiacModules).toHaveBeenCalledWith(avatarAddress, 42161)
    })
  })

  describe('Launch', () => {
    it('launches the route upon save', async () => {
      mockRoute({ id: 'route-id' })

      await render(
        '/routes/edit/route-id',
        [
          {
            path: '/routes/edit/:routeId',
            Component: EditRoute,
            loader,
            action,
          },
        ],
        { inspectRoutes: ['/:activeRouteId'] },
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      await expectRouteToBe('/route-id')
    })

    describe('Clearing transactions', () => {
      it('warns about clearing transactions when the avatars differ', async () => {
        const currentAvatar = randomPrefixedAddress()
        const newAvatar = randomAddress()

        const selectedRoute = createMockRoute({
          id: 'firstRoute',
          avatar: currentAvatar,
        })

        await mockRoutes(selectedRoute)
        await saveLastUsedRouteId(selectedRoute.id)

        await render(
          '/routes/edit/firstRoute',
          [
            {
              path: '/routes/edit/:routeId',
              Component: EditRoute,
              loader,
              action,
            },
          ],
          {
            initialState: [createTransaction()],
          },
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Clear piloted Safe' }),
        )
        await userEvent.type(
          screen.getByRole('textbox', { name: 'Piloted Safe' }),
          newAvatar,
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Save & Launch' }),
        )

        expect(
          screen.getByRole('dialog', { name: 'Clear transactions' }),
        ).toBeInTheDocument()
      })

      it('does not warn about clearing transactions when the avatars stay the same', async () => {
        const avatar = randomPrefixedAddress()

        const selectedRoute = createMockRoute({
          id: 'firstRoute',
          label: 'First route',
          avatar,
        })

        await mockRoutes(selectedRoute)
        await saveLastUsedRouteId(selectedRoute.id)

        await render(
          '/routes/edit/firstRoute',
          [
            {
              path: '/routes/edit/:routeId',
              Component: EditRoute,
              loader,
              action,
            },
          ],
          {
            initialState: [createTransaction()],
          },
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Clear piloted Safe' }),
        )

        await userEvent.type(
          screen.getByRole('textbox', { name: 'Piloted Safe' }),
          parsePrefixedAddress(avatar),
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Save & Launch' }),
        )

        expect(
          screen.queryByRole('dialog', { name: 'Clear transactions' }),
        ).not.toBeInTheDocument()
      })

      it('should not warn about clearing transactions when there are none', async () => {
        const selectedRoute = createMockRoute({
          id: 'firstRoute',
          label: 'First route',
        })

        await mockRoutes(selectedRoute)
        await saveLastUsedRouteId(selectedRoute.id)

        await render('/routes/edit/firstRoute', [
          {
            path: '/routes/edit/:routeId',
            Component: EditRoute,
            loader,
            action,
          },
        ])

        await userEvent.click(
          screen.getByRole('button', { name: 'Clear piloted Safe' }),
        )

        await userEvent.type(
          screen.getByRole('textbox', { name: 'Piloted Safe' }),
          randomAddress(),
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Save & Launch' }),
        )

        expect(
          screen.queryByRole('dialog', { name: 'Clear transactions' }),
        ).not.toBeInTheDocument()
      })

      it('is possible to launch a new route and clear transactions', async () => {
        const selectedRoute = createMockRoute({
          id: 'firstRoute',
          label: 'First route',
          avatar: randomPrefixedAddress(),
        })

        await mockRoutes(selectedRoute, {
          id: 'another-route',
          avatar: randomPrefixedAddress(),
        })
        await saveLastUsedRouteId('another-route')

        await render(
          '/routes/edit/firstRoute',
          [
            {
              path: '/routes/edit/:routeId',
              Component: EditRoute,
              loader,
              action,
            },
          ],
          {
            initialState: [createTransaction()],
            inspectRoutes: [
              '/:activeRouteId/clear-transactions/:newActiveRouteId',
            ],
          },
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Clear piloted Safe' }),
        )

        await userEvent.type(
          screen.getByRole('textbox', { name: 'Piloted Safe' }),
          randomAddress(),
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Save & Launch' }),
        )

        await userEvent.click(
          screen.getByRole('button', { name: 'Clear transactions' }),
        )

        await expectRouteToBe('/another-route/clear-transactions/firstRoute')
      })
    })
  })
})
