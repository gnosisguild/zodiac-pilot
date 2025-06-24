import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  dbClient,
  findDefaultRoute,
  getAccount,
  getDefaultRoute,
  getWalletByAddress,
  setDefaultRoute,
} from '@zodiac/db'
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

describe('Edit account', () => {
  beforeEach(() => {
    mockQueryRoutes.mockResolvedValue([])
    mockQueryInitiators.mockResolvedValue([])
  })

  describe('Label', () => {
    it('displays the current label', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user, {
        label: 'Test label',
      })

      await render(href('/account/:accountId', { accountId: account.id }), {
        tenant,
        user,
      })

      expect(await screen.findByRole('textbox', { name: 'Label' })).toHaveValue(
        'Test label',
      )
    })

    it('is possible to update the label', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user, { label: '' })

      const { waitForPendingActions } = await render(
        href('/account/:accountId', { accountId: account.id }),
        { tenant, user },
      )

      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        'New label',
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(getAccount(dbClient(), account.id)).resolves.toHaveProperty(
        'label',
        'New label',
      )
    })
  })

  describe('Pilot Signer', () => {
    it('lists all wallets that can be signers on the selected account', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)

      const address = randomAddress()

      await walletFactory.create(user, {
        label: 'Test Wallet',
        address,
      })

      mockQueryInitiators.mockResolvedValue([address])

      await render(href('/account/:accountId', { accountId: account.id }), {
        tenant,
        user,
      })

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )

      expect(
        await screen.findByRole('option', { name: 'Test Wallet' }),
      ).toBeInTheDocument()
    })

    it('shows the current initiator', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, {
        label: 'Test Wallet',
      })
      const route = await routeFactory.create(account, wallet)

      await setDefaultRoute(dbClient(), tenant, user, route)

      mockQueryInitiators.mockResolvedValue([wallet.address])

      await render(href('/account/:accountId', { accountId: account.id }), {
        tenant,
        user,
      })

      expect(await screen.findByText('Test Wallet')).toBeInTheDocument()
    })

    it('is possible to add an initiator', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, {
        label: 'Test Wallet',
      })

      mockQueryInitiators.mockResolvedValue([wallet.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId', { accountId: account.id }),
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

      const activeRoute = await getDefaultRoute(
        dbClient(),
        tenant,
        user,
        account.id,
      )

      expect(activeRoute).toHaveProperty('userId', user.id)
      expect(activeRoute.route).toMatchObject({
        fromId: wallet.id,
        toId: account.id,
      })
    })

    it('is possible to remove the initiator', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user)
      const route = await routeFactory.create(account, wallet)

      await setDefaultRoute(dbClient(), tenant, user, route)

      mockQueryInitiators.mockResolvedValue([wallet.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId', { accountId: account.id }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove Pilot Signer' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(
        findDefaultRoute(dbClient(), tenant, user, account.id),
      ).resolves.not.toBeDefined()
    })

    it('is possible to update the initiator', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const walletA = await walletFactory.create(user)
      const walletB = await walletFactory.create(user, {
        label: 'Another wallet',
      })

      const route = await routeFactory.create(account, walletA)

      await setDefaultRoute(dbClient(), tenant, user, route)

      mockQueryInitiators.mockResolvedValue([walletA.address, walletB.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId', { accountId: account.id }),
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

      const activeRoute = await getDefaultRoute(
        dbClient(),
        tenant,
        user,
        account.id,
      )

      expect(activeRoute).toHaveProperty('userId', user.id)
      expect(activeRoute.route).toMatchObject({
        fromId: walletB.id,
        toId: account.id,
      })
    })

    it('is possible to create an initiator wallet on the fly', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)

      const walletAddress = randomAddress()

      mockQueryInitiators.mockResolvedValue([walletAddress])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId', { accountId: account.id }),
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

      const activeRoute = await getDefaultRoute(
        dbClient(),
        tenant,
        user,
        account.id,
      )

      const wallet = await getWalletByAddress(dbClient(), user, walletAddress)

      expect(activeRoute.route).toHaveProperty('wallet', wallet)
    })
  })

  describe('Route', () => {
    it('is auto-selects the first route', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
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
        href('/account/:accountId', {
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

      const activeRoute = await getDefaultRoute(
        dbClient(),
        tenant,
        user,
        account.id,
      )

      expect(activeRoute.route).toHaveProperty('waypoints', waypoints)
    })

    it('is possible to change the selected route', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
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

      await setDefaultRoute(dbClient(), tenant, user, route)

      const secondRoute = createMockRoute({ id: 'second', waypoints })

      mockQueryRoutes.mockResolvedValue([firstRoute, secondRoute])

      const { waitForPendingActions } = await render(
        href('/account/:accountId', {
          accountId: account.id,
        }),
        { tenant, user },
      )

      // click last route in radio select
      await userEvent.click((await screen.findAllByRole('radio'))[1])

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      const activeRoute = await getDefaultRoute(
        dbClient(),
        tenant,
        user,
        account.id,
      )

      expect(activeRoute.route).toHaveProperty('waypoints', waypoints)
    })
  })

  describe('Routes', () => {
    it('lists all routes', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      await routeFactory.create(account, wallet, {
        label: 'Route A',
      })
      await routeFactory.create(account, wallet, {
        label: 'Route B',
      })

      await render(href('/account/:accountId', { accountId: account.id }), {
        user,
        tenant,
        features: ['multiple-routes'],
      })

      expect(
        await screen.findByRole('tab', { name: 'Route A' }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('tab', { name: 'Route B' }),
      ).toBeInTheDocument()
    })

    it('is shows the initiator of the specified route', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const walletA = await walletFactory.create(user)
      const walletB = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const routeA = await routeFactory.create(account, walletA, {
        label: 'Route A',
      })
      await routeFactory.create(account, walletB, {
        label: 'Route B',
      })

      await setDefaultRoute(dbClient(), tenant, user, routeA)

      mockQueryInitiators.mockResolvedValue([walletA.address, walletB.address])

      await render(href('/account/:accountId', { accountId: account.id }), {
        user,
        tenant,
        features: ['multiple-routes'],
      })

      await userEvent.click(await screen.findByRole('tab', { name: 'Route B' }))

      expect(await screen.findByText(walletB.label)).toBeInTheDocument()
    })
  })
})
