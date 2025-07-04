import { render } from '@/test-utils'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  dbClient,
  getDefaultRoute,
  getRoute,
  getRoutes,
  getWalletByAddress,
  setDefaultRoute,
} from '@zodiac/db'
import type { Route } from '@zodiac/db/schema'
import {
  accountFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import {
  createMockEoaAccount,
  createMockRoute,
  createMockStartingWaypoint,
  createMockWaypoints,
  expectRouteToBe,
  randomAddress,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { queryInitiators, queryRoutes } from 'ser-kit'
import { getAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    queryInitiators: vi.fn(),
    queryRoutes: vi.fn(),
  }
})

const mockQueryInitiators = vi.mocked(queryInitiators)
const mockQueryRoutes = vi.mocked(queryRoutes)

describe('Routes', () => {
  beforeEach(() => {
    mockQueryRoutes.mockResolvedValue([])
    mockQueryInitiators.mockResolvedValue([])
  })

  describe('Pilot Signer', () => {
    it('lists all wallets that can be signers on the selected account', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const address = randomAddress()

      await walletFactory.create(user, {
        label: 'Test Wallet',
        address,
      })

      mockQueryInitiators.mockResolvedValue([address])

      await render(
        href('/account/:accountId/route/:routeId?', { accountId: account.id }),
        {
          tenant,
          user,
        },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )

      expect(
        await screen.findByRole('option', { name: 'Test Wallet' }),
      ).toBeInTheDocument()
    })

    it('shows the current initiator', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, {
        label: 'Test Wallet',
      })
      const route = await routeFactory.create(account, wallet)

      mockQueryInitiators.mockResolvedValue([wallet.address])

      await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        {
          tenant,
          user,
        },
      )

      expect(await screen.findByText('Test Wallet')).toBeInTheDocument()
    })

    it('is possible to add an initiator', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, {
        label: 'Test Wallet',
      })

      mockQueryInitiators.mockResolvedValue([wallet.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', { accountId: account.id }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Test Wallet' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      const [route] = await getRoutes(dbClient(), tenant.id, {
        userId: user.id,
        accountId: account.id,
      })

      expect(route).toMatchObject({
        fromId: wallet.id,
        toId: account.id,
      })
    })

    it('is possible to remove the initiator', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user)
      const route = await routeFactory.create(account, wallet)

      mockQueryInitiators.mockResolvedValue([wallet.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove Pilot Signer' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(
        getRoutes(dbClient(), tenant.id, {
          accountId: account.id,
          userId: user.id,
        }),
      ).resolves.toEqual([])
    })

    it('is possible to update the initiator', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const walletA = await walletFactory.create(user)
      const walletB = await walletFactory.create(user, {
        label: 'Another wallet',
      })

      const route = await routeFactory.create(account, walletA)

      mockQueryInitiators.mockResolvedValue([walletA.address, walletB.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Another wallet' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(getRoute(dbClient(), route.id)).resolves.toMatchObject({
        fromId: walletB.id,
        toId: account.id,
      })
    })

    it('is possible to create an initiator wallet on the fly', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const walletAddress = randomAddress()

      mockQueryInitiators.mockResolvedValue([walletAddress])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', { accountId: account.id }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: getAddress(walletAddress) }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      const [route] = await getRoutes(dbClient(), tenant.id, {
        userId: user.id,
        accountId: account.id,
      })

      const wallet = await getWalletByAddress(dbClient(), user, walletAddress)

      expect(route).toHaveProperty('fromId', wallet.id)
    })
  })

  describe('Default route', () => {
    it('marks the first route as the default', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user, { label: 'Test Wallet' })
      const account = await accountFactory.create(tenant, user)

      mockQueryInitiators.mockResolvedValue([wallet.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', { accountId: account.id }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Test Wallet' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      const [route] = await getRoutes(dbClient(), tenant.id, {
        userId: user.id,
        accountId: account.id,
      })

      await expect(
        getDefaultRoute(dbClient(), tenant, user, account.id),
      ).resolves.toHaveProperty('routeId', route.id)
    })

    it('leaves the default route untouched when it has already been defined', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const walletA = await walletFactory.create(user, { label: 'Wallet A' })
      const walletB = await walletFactory.create(user, { label: 'Wallet B' })
      const account = await accountFactory.create(tenant, user)

      const routeA = await routeFactory.create(account, walletA)
      const routeB = await routeFactory.create(account, walletB)

      await setDefaultRoute(dbClient(), tenant, user, routeA)

      mockQueryInitiators.mockResolvedValue([walletA.address, walletB.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: routeB.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Wallet A' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(
        getDefaultRoute(dbClient(), tenant, user, account.id),
      ).resolves.toHaveProperty('routeId', routeA.id)
    })

    it('is possible to select a route as the default', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const route = await routeFactory.create(account, wallet)

      const { waitForPendingActions } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { tenant, user, features: ['multiple-routes'] },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Route options' }),
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Use as default route' }),
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Update' }),
      )

      await waitForPendingActions()

      await expect(
        getDefaultRoute(dbClient(), tenant, user, account.id),
      ).resolves.toHaveProperty('routeId', route.id)
    })

    it('removes the current default route', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const routeA = await routeFactory.create(account, wallet)
      const routeB = await routeFactory.create(account, wallet, {
        label: 'Route B',
      })

      await setDefaultRoute(dbClient(), tenant, user, routeA)

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: routeA.id,
        }),
        { tenant, user, features: ['multiple-routes'] },
      )

      const { findByRole } = within(
        await screen.findByRole('tab', { name: 'Route B' }),
      )

      await userEvent.click(
        await findByRole('button', { name: 'Route options' }),
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Use as default route' }),
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Update' }),
      )

      await waitForPendingActions()
      await waitForPendingLoaders()

      await expect(
        getDefaultRoute(dbClient(), tenant, user, account.id),
      ).resolves.toHaveProperty('routeId', routeB.id)
    })

    it('does not crash if the current default route stays the default', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const route = await routeFactory.create(account, wallet, {
        label: 'Route',
      })

      await setDefaultRoute(dbClient(), tenant, user, route)

      const { waitForPendingActions } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { tenant, user, features: ['multiple-routes'] },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Route options' }),
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

      await userEvent.click(
        await screen.findByRole('button', { name: 'Update' }),
      )

      await waitForPendingActions()

      await expect(
        getDefaultRoute(dbClient(), tenant, user, account.id),
      ).resolves.toHaveProperty('routeId', route.id)
    })
  })

  describe('SER Route', () => {
    it('auto-selects the first route', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, {
        label: 'Test wallet',
      })

      mockQueryInitiators.mockResolvedValue([wallet.address])

      const waypoints = createMockWaypoints({
        end: true,
      })

      const newRoute = createMockRoute({ id: 'first', waypoints })

      mockQueryRoutes.mockResolvedValue([newRoute])

      const { waitForPendingLoaders, waitForPendingActions } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Test wallet' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      const [route] = await getRoutes(dbClient(), tenant.id, {
        userId: user.id,
        accountId: account.id,
      })

      expect(route).toHaveProperty('waypoints', waypoints)
    })

    it('is possible to change the selected route', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, {
        label: 'Test wallet',
      })

      mockQueryInitiators.mockResolvedValue([wallet.address])

      const waypoints = createMockWaypoints({
        end: true,
        start: createMockStartingWaypoint(
          createMockEoaAccount({ address: randomAddress() }),
        ),
      })

      const firstRoute = createMockRoute({
        id: 'first',
        waypoints: createMockWaypoints({
          end: true,
        }),
      })

      const route = await routeFactory.create(account, wallet, {
        waypoints: firstRoute.waypoints,
      })

      const secondRoute = createMockRoute({ id: 'second', waypoints })

      mockQueryRoutes.mockResolvedValue([firstRoute, secondRoute])

      const { waitForPendingActions } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { tenant, user },
      )

      // click last route in radio select
      await userEvent.click((await screen.findAllByRole('radio'))[1])

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(getRoute(dbClient(), route.id)).resolves.toHaveProperty(
        'waypoints',
        waypoints,
      )
    })
  })

  describe('Routes', () => {
    it('lists all routes', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const routeA = await routeFactory.create(account, wallet, {
        label: 'Route A',
      })
      const routeB = await routeFactory.create(account, wallet, {
        label: 'Route B',
      })

      await render(
        href('/account/:accountId/route/:routeId?', { accountId: account.id }),
        {
          user,
          tenant,
          features: ['multiple-routes'],
        },
      )

      expect(
        await screen.findByRole('tab', { name: 'Route A' }),
      ).toHaveAttribute(
        'href',
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: routeA.id,
        }),
      )
      expect(
        await screen.findByRole('tab', { name: 'Route B' }),
      ).toHaveAttribute(
        'href',
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: routeB.id,
        }),
      )
    })

    it('is shows the initiator of the specified route', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const route = await routeFactory.create(account, wallet, {
        label: 'Route B',
      })

      mockQueryInitiators.mockResolvedValue([wallet.address])

      await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        {
          user,
          tenant,
          features: ['multiple-routes'],
        },
      )

      expect(await screen.findByText(wallet.label)).toBeInTheDocument()
    })

    describe('Label', () => {
      it('is possible to change the label of a route', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const wallet = await walletFactory.create(user)
        const account = await accountFactory.create(tenant, user)
        const route = await routeFactory.create(account, wallet, {
          label: 'Test route',
        })

        const { waitForPendingActions } = await render(
          href('/account/:accountId/route/:routeId?', {
            accountId: account.id,
            routeId: route.id,
          }),
          { user, tenant, features: ['multiple-routes'] },
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Route options' }),
        )
        await userEvent.click(
          await screen.findByRole('button', { name: 'Edit' }),
        )

        const { findByRole } = within(
          await screen.findByRole('dialog', { name: 'Edit route' }),
        )

        await userEvent.type(
          await findByRole('textbox', { name: 'Label' }),
          ' Updated',
        )
        await userEvent.click(
          await screen.findByRole('button', { name: 'Update' }),
        )

        await waitForPendingActions()

        expect(
          await screen.findByRole('tab', { name: `${route.label} Updated` }),
        ).toBeInTheDocument()
      })
    })

    describe('Add new', () => {
      it('is possible to add a new route to an account', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const wallet = await walletFactory.create(user, { label: 'New wallet' })
        const account = await accountFactory.create(tenant, user)

        mockQueryInitiators.mockResolvedValue([wallet.address])
        mockQueryRoutes.mockResolvedValue([createMockRoute()])

        await render(
          href('/account/:accountId/route/:routeId?', {
            accountId: account.id,
          }),
          { user, tenant, features: ['multiple-routes'] },
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Add route' }),
        )

        const { findByRole } = within(
          await screen.findByRole('dialog', { name: 'Add route' }),
        )

        await userEvent.type(
          await findByRole('textbox', { name: 'Label' }),
          'New route',
        )

        await userEvent.click(
          await findByRole('combobox', { name: 'Pilot Signer' }),
        )
        await userEvent.click(
          await findByRole('option', { name: 'New wallet' }),
        )

        await userEvent.click(await findByRole('button', { name: 'Add' }))

        expect(
          await screen.findByRole('tab', { name: 'New route' }),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Remove', () => {
    const removeRoute = async (route: Route) => {
      const { findByRole } = within(
        await screen.findByRole('tab', { name: route.label! }),
      )

      await userEvent.click(
        await findByRole('button', { name: 'Route options' }),
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove' }),
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove' }),
      )
    }

    it('is possible to remove a route', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const route = await routeFactory.create(account, wallet, {
        label: 'Test route',
      })

      const { waitForPendingActions } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { user, tenant, features: ['multiple-routes'] },
      )

      await removeRoute(route)

      await waitForPendingActions()

      await expect(
        getRoutes(dbClient(), tenant.id, {
          accountId: account.id,
          userId: user.id,
        }),
      ).resolves.toEqual([])
    })

    it('redirects to the default route if another route has been removed', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      await routeFactory.create(account, wallet, {
        label: 'Route A',
      })
      const routeB = await routeFactory.create(account, wallet, {
        label: 'Route B',
      })
      const routeC = await routeFactory.create(account, wallet, {
        label: 'Route C',
      })

      await setDefaultRoute(dbClient(), tenant, user, routeB)

      await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: routeC.id,
        }),
        { user, tenant, features: ['multiple-routes'] },
      )

      await removeRoute(routeC)

      await expectRouteToBe(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: routeB.id,
        }),
      )
    })

    it('redirects to the first route when the default route is removed', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const routeA = await routeFactory.create(account, wallet, {
        label: 'Route A',
      })
      const routeB = await routeFactory.create(account, wallet, {
        label: 'Route B',
      })
      await routeFactory.create(account, wallet, {
        label: 'Route C',
      })

      await setDefaultRoute(dbClient(), tenant, user, routeB)

      await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: routeB.id,
        }),
        { user, tenant, features: ['multiple-routes'] },
      )

      await removeRoute(routeB)

      await expectRouteToBe(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: routeA.id,
        }),
      )
    })

    it('redirects to the empty page when the last route is being removed', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const route = await routeFactory.create(account, wallet, {
        label: 'Route A',
      })

      await setDefaultRoute(dbClient(), tenant, user, route)

      await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { user, tenant, features: ['multiple-routes'] },
      )

      await removeRoute(route)

      await expectRouteToBe(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
        }),
      )
    })
  })
})
